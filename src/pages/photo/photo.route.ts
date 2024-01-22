import zod, { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { FaceId, zIsFaceId } from '../../domain/FaceId'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { PersonId, zIsPersonId } from '../../domain/PersonId'
import { PhotoId, zIsPhotoId } from '../../domain/PhotoId'
import { zIsThreadId } from '../../domain/ThreadId'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getUuid } from '../../libs/getUuid'
import { makePersonId } from '../../libs/makePersonId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getPhotoFamilyId } from '../_getPhotoFamily'
import { isPersonSharedWithFamily } from '../_isPersonSharedWithFamily'
import { pageRouter } from '../pageRouter'
import { PersonAutoSharedWithPhotoFace } from '../share/PersonAutoSharedWithPhotoFace'
import { NewPhotoPage } from './PhotoPage/NewPhotoPage'
import { PhotoPageUrl } from './PhotoPageUrl'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { getNewPhotoPageProps } from './getNewPhotoPageProps'
import { getFamiliesWithAccessToPerson } from '../_getFamiliesWithAccessToPerson'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter
  .route(PhotoPageUrl(':photoId'))
  .get(requireAuth(), async (request, response) => {
    try {
      const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.params)

      const { threadId, profileId, photoListForFamilyId, updated } = z
        .object({
          threadId: zIsThreadId.optional(),
          profileId: zIsPersonId.optional(),
          updated: z.string().optional(),
          photoListForFamilyId: zIsFamilyId.optional(),
        })
        .parse(request.query)

      const props = await getNewPhotoPageProps({
        photoId,
        userId: request.session.user!.id,
      })

      if (threadId) {
        props.context = { type: 'thread', threadId, editable: !!updated }
      }

      if (profileId) {
        props.context = { type: 'profile', profileId }
      }

      if (photoListForFamilyId) {
        props.context = { type: 'familyPhotoList', familyId: photoListForFamilyId }
      }

      responseAsHtml(request, response, NewPhotoPage(props))
    } catch (error) {
      console.error('error', error)
      response.sendStatus(500)
    }
  })
  .post(requireAuth(), async (request, response) => {
    try {
      const userId = request.session.user!.id

      const { threadId } = z.object({ threadId: zIsThreadId.optional() }).parse(request.query)

      const { action } = zod
        .object({
          action: zod.string().optional(),
        })
        .parse(request.body)

      const { photoId } = zod
        .object({
          photoId: zIsPhotoId,
        })
        .parse(request.params)

      if (action) {
        if (action === 'addCaption') {
          const { caption } = zod
            .object({
              caption: zod.string(),
            })
            .parse(request.body)
          const captionId = getUuid()

          await addToHistory(
            UserAddedCaptionToPhoto({
              photoId,
              caption: {
                id: captionId,
                body: caption,
              },
              userId,
            })
          )
        } else if (action === 'submitFamilyMemberName') {
          const { faceId, newFamilyMemberName } = z
            .object({
              faceId: zIsFaceId,
              newFamilyMemberName: z.string().optional(),
            })
            .parse(request.body)

          if (newFamilyMemberName && newFamilyMemberName.length > 0) {
            const personId = makePersonId()
            const familyId = await getPhotoFamilyId(photoId)
            if (!familyId) {
              throw new Error('Trying to submit family member name but cannot find the photo family')
            }
            await addToHistory(
              UserNamedPersonInPhoto({
                userId,
                photoId,
                faceId,
                personId,
                name: newFamilyMemberName,
                familyId,
              })
            )

            try {
              await personsIndex.saveObject({
                objectID: personId,
                personId,
                name: newFamilyMemberName,
                familyId,
                visible_by: [`family/${familyId}`, `user/${userId}`],
              })
            } catch (error) {
              console.error('Could not add new family member to algolia index', error)
              throw error
            }
          } else {
            const { existingFamilyMemberId } = z
              .object({
                existingFamilyMemberId: zIsPersonId,
              })
              .parse(request.body)

            const familyId = await getPhotoFamilyId(photoId)
            if (!familyId) {
              throw new Error('Trying to submit family member name but cannot find the photo family')
            }

            await sharePersonIfOutsideOfFamily({ personId: existingFamilyMemberId, familyId, photoId, faceId })

            await addToHistory(
              UserRecognizedPersonInPhoto({
                userId,
                photoId,
                faceId,
                personId: existingFamilyMemberId,
              })
            )
          }
        } else if (action === 'ignoreFamilyMemberFaceInPhoto') {
          const { faceId } = z
            .object({
              faceId: zIsFaceId,
            })
            .parse(request.body)
          await addToHistory(
            FaceIgnoredInPhoto({
              ignoredBy: userId,
              photoId,
              faceId,
            })
          )
        }
      }

      if (threadId) {
        return response.redirect(`/photo/${photoId}/photo.html?threadId=${threadId}&updated=true`)
      }
      return response.redirect(`/photo/${photoId}/photo.html`)
    } catch (error) {
      console.error('Error in photo route', error)
      return response.status(500).send("Boom, crash, bing. Quelque chose ne s'est pas bien passé.")
    }
  })

async function sharePersonIfOutsideOfFamily({
  personId,
  familyId,
  photoId,
  faceId,
}: {
  personId: PersonId
  familyId: FamilyId
  photoId: PhotoId
  faceId: FaceId
}): Promise<void> {
  if (await isPersonSharedWithFamily({ personId, familyId })) {
    return
  }

  await addToHistory(
    PersonAutoSharedWithPhotoFace({
      personId,
      familyId,
      photoId,
      faceId,
    })
  )

  try {
    const personFamilies = await getFamiliesWithAccessToPerson({ personId })
    await personsIndex.partialUpdateObject({
      objectID: personId,
      visible_by: personFamilies.map((familyId) => `family/${familyId}`),
    })
  } catch (error) {
    console.error('Could not share person with family to algolia index', error)
  }
}
