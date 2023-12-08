import multer from 'multer'
import zod, { z } from 'zod'
import fs from 'node:fs'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { zIsFaceId } from '../../domain/FaceId'
import { zIsPersonId } from '../../domain/PersonId'
import { PhotoId, zIsPhotoId } from '../../domain/PhotoId'
import { ThreadId, zIsThreadId } from '../../domain/ThreadId'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getUuid } from '../../libs/getUuid'
import { makePersonId } from '../../libs/makePersonId'
import { makePhotoId } from '../../libs/makePhotoId'
import { makeThreadId } from '../../libs/makeThreadId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { doesPhotoExist } from '../_doesPhotoExist'
import { PhotoListPageUrl } from '../photoList/PhotoListPageUrl'
import { pageRouter } from '../pageRouter'
import { NewPhotoPage } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { UserDeletedPhoto } from './UserDeletedPhoto'
import { getNewPhotoPageProps } from './getNewPhotoPageProps'
import { detectFacesInPhotoUsingAWS } from './recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { ThreadUrl } from '../thread/ThreadUrl'
import { getThreadFamily } from '../_getThreadFamily'
import { getPhotoFamilyId } from '../_getPhotoFamily'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { Thread } from '@sentry/node'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter
  .route('/photo/:photoId/photo.html')
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
        props.context = { type: 'thread', threadId }
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
              addedBy: userId,
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

pageRouter.route('/add-photo.html').post(requireAuth(), upload.single('photo'), async (request, response) => {
  try {
    const { familyId } = zod
      .object({
        familyId: zIsFamilyId.optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    const { file } = request

    if (!file) return new Error('We did not receive any image.')

    const photoId = await uploadNewPhoto({ file, familyId, userId })

    if (familyId) {
      return response.redirect(`/photo/${photoId}/photo.html?photoListForFamilyId=${familyId}`)
    }

    return response.redirect(`/photo/${photoId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})

pageRouter.route('/delete-photo').post(requireAuth(), async (request, response) => {
  try {
    const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.body)
    const userId = request.session.user!.id

    // TODO: Make sure the user is the author of the photo
    const isAllowed = await doesPhotoExist({ photoId })

    if (!isAllowed) {
      return response.status(403).send("La suppression de la photo a échoué parce que vous n'en êtes pas l'auteur.")
    }

    // Emit
    await addToHistory(
      UserDeletedPhoto({
        photoId,
        userId,
      })
    )

    return response.redirect(PhotoListPageUrl)
  } catch (error) {
    console.error('Error in photo route')
    return response.status(500).send('La suppression de la photo a échoué.')
  }
})

type UploadPhotoToChatArgs = {
  file: Express.Multer.File
  userId: AppUserId
  familyId: FamilyId | undefined
}
async function uploadNewPhoto({ file, familyId, userId }: UploadPhotoToChatArgs) {
  const { path: originalPath } = file
  const photoId = makePhotoId()

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(
    UserUploadedPhotoToChat({
      chatId: photoId as string as ThreadId, // Each photo has a thread
      photoId,
      location,
      uploadedBy: userId,
      familyId: familyId || (userId as string as FamilyId),
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })

  return photoId
}
