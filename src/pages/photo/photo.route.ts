import zod, { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { addFamilyVisibilityToIndex, personsIndex } from '../../dependencies/search.js'
import { FaceId, zIsFaceId } from '../../domain/FaceId.js'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId.js'
import { PersonId, zIsPersonId } from '../../domain/PersonId.js'
import { PhotoId, zIsPhotoId } from '../../domain/PhotoId.js'
import { zIsThreadId } from '../../domain/ThreadId.js'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto.js'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto.js'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto.js'
import { getUuid } from '../../libs/getUuid.js'
import { makePersonId } from '../../libs/makePersonId.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { getPhotoFamilyId } from '../_getPhotoFamily.js'
import { isPersonSharedWithFamily } from '../_isPersonSharedWithFamily.js'
import { isPhotoAccessibleToUser } from '../_isPhotoAccessibleToUser.js'
import { pageRouter } from '../pageRouter.js'
import { PersonAutoSharedWithPhotoFace } from '../share/PersonAutoSharedWithPhotoFace.js'
import { NewPhotoPage } from './PhotoPage/NewPhotoPage.js'
import { PhotoPageUrl } from './PhotoPageUrl.js'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto.js'
import { getNewPhotoPageProps } from './getNewPhotoPageProps.js'
import { UserSetPhotoLocation } from './UserSetPhotoLocation.js'
import { UserSetPhotoDate } from './UserSetPhotoDate.js'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter
  .route(PhotoPageUrl(':photoId'))
  .get(requireAuth(), async (request, response, next) => {
    try {
      const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.params)
      const userId = request.session.user!.id

      if (!(await isPhotoAccessibleToUser({ photoId, userId }))) {
        throw new Error("Vous n'avez pas accès à cette photo")
      }

      const { threadId, profileId, photoListForFamilyId, edit } = z
        .object({
          threadId: zIsThreadId.optional(),
          profileId: zIsPersonId.optional(),
          edit: z.string().optional(),
          photoListForFamilyId: zIsFamilyId.optional(),
        })
        .parse(request.query)

      const props = await getNewPhotoPageProps({
        photoId,
        userId,
      })

      if (threadId) {
        props.context = { type: 'thread', threadId, editable: !!edit }
      }

      if (profileId) {
        props.context = { type: 'profile', profileId }
      }

      if (photoListForFamilyId) {
        props.context = { type: 'familyPhotoList', familyId: photoListForFamilyId }
      }

      responseAsHtml(request, response, NewPhotoPage(props))
    } catch (error) {
      next(error)
    }
  })
  .post(requireAuth(), async (request, response, next) => {
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
                visible_by: [`family/${familyId}`, `family/${userId}`],
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
        } else if (action === 'ignoreAllOtherFaces') {
          const { faceId } = z
            .object({
              faceId: zIsFaceId.or(z.array(zIsFaceId)),
            })
            .parse(request.body)
          const faceIds = Array.isArray(faceId) ? faceId : [faceId]
          for (const faceId of faceIds) {
            await addToHistory(
              FaceIgnoredInPhoto({
                ignoredBy: userId,
                photoId,
                faceId,
              })
            )
          }
        } else if (action === 'setLocation') {
          const { gpsOption, nameOption, locationName, isIrrelevant } = z
            .object({
              gpsOption: z.union([z.literal('exif'), z.literal('none')]).optional(),
              nameOption: z.union([z.literal('user'), z.literal('mapboxFromExif')]),
              locationName: z.string(),
              isIrrelevant: z.literal('on').optional(),
            })
            .parse(request.body)

          if (isIrrelevant) {
            await addToHistory(
              UserSetPhotoLocation({
                photoId,
                userId,
                isIrrelevant: true,
              })
            )
          } else {
            await addToHistory(
              UserSetPhotoLocation({
                photoId,
                userId,
                isIrrelevant: false,
                gpsOption: gpsOption || 'none',
                name: nameOption === 'user' ? { option: 'user', locationName } : { option: 'mapboxFromExif' },
              })
            )
          }
        } else if (action === 'setDate') {
          const { dateOption, dateAsText, isIrrelevant } = z
            .object({
              dateOption: z.union([z.literal('exif'), z.literal('user'), z.literal('none')]),
              dateAsText: z.string(),
              isIrrelevant: z.literal('on').optional(),
            })
            .parse(request.body)
          if (isIrrelevant) {
            await addToHistory(
              UserSetPhotoDate({
                photoId,
                userId,
                dateOption: 'none',
              })
            )
          } else if (dateOption === 'user' && dateAsText) {
            await addToHistory(
              UserSetPhotoDate({
                photoId,
                userId,
                dateOption,
                dateAsText,
              })
            )
          } else {
            await addToHistory(
              UserSetPhotoDate({
                photoId,
                userId,
                dateOption: dateOption === 'user' ? 'none' : dateOption,
              })
            )
          }
        }
      }

      if (threadId) {
        return response.redirect(`/photo/${photoId}/photo.html?threadId=${threadId}&updated=true`)
      }
      return response.redirect(`/photo/${photoId}/photo.html`)
    } catch (error) {
      console.error('Error in photo route', error)
      next(error)
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

  await addFamilyVisibilityToIndex({ personId, familyId })
}
