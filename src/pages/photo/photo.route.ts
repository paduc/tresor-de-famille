import multer from 'multer'
import zod, { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { uploadPhotoToChat } from '../chat/uploadPhotoToChat/uploadPhotoToChat'
import { pageRouter } from '../pageRouter'
import { NewPhotoPage } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { getNewPhotoPageProps } from './getNewPhotoPageProps'
import { detectFacesInPhotoUsingAWS } from './recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'

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
      const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)

      const { threadId, updated } = z
        .object({ threadId: zIsUUID.optional(), updated: z.string().optional() })
        .parse(request.query)

      const props = await getNewPhotoPageProps({ photoId, userId: request.session.user!.id })

      if (threadId) {
        props.context = { type: 'thread', threadId }
      }

      if (updated) {
        props.updated = true
      }

      responseAsHtml(request, response, NewPhotoPage(props))
    } catch (error) {
      console.error('error', error)
      response.send(error)
    }
  })
  .post(requireAuth(), async (request, response) => {
    try {
      const userId = request.session.user!.id

      const { threadId } = z.object({ threadId: zIsUUID.optional() }).parse(request.query)

      const { action } = zod
        .object({
          action: zod.string().optional(),
        })
        .parse(request.body)

      const { photoId } = zod
        .object({
          photoId: zIsUUID,
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
              faceId: zIsUUID,
              newFamilyMemberName: z.string(),
            })
            .parse(request.body)

          if (newFamilyMemberName.length > 0) {
            const personId = getUuid()
            await addToHistory(
              UserNamedPersonInPhoto({
                userId,
                photoId,
                faceId,
                personId,
                name: newFamilyMemberName,
              })
            )

            try {
              await personsIndex.saveObject({
                objectID: personId,
                personId,
                name: newFamilyMemberName,
                visible_by: [`person/${personId}`, `user/${userId}`],
              })
            } catch (error) {
              console.error('Could not add new family member to algolia index', error)
            }
          } else {
            const { existingFamilyMemberId } = z
              .object({
                existingFamilyMemberId: zIsUUID,
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
              faceId: zIsUUID,
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
      throw error
    }
  })

pageRouter.route('/add-photo.html').post(requireAuth(), upload.single('photo'), async (request, response) => {
  try {
    const { chatId: chatIdFromForm, isOnboarding } = zod
      .object({ chatId: zIsUUID.optional(), isOnboarding: zod.string().optional() })
      .parse(request.body)

    const chatId = chatIdFromForm || getUuid()

    const userId = request.session.user!.id

    const { file } = request

    if (!file) return new Error('We did not receive any image.')
    const photoId = getUuid()

    await uploadPhotoToChat({ file, photoId, chatId, userId })

    await detectFacesInPhotoUsingAWS({ file, photoId })

    if (isOnboarding && isOnboarding === 'yes') {
      return response.redirect('/')
    }

    if (chatIdFromForm) {
      return response.redirect(`/chat/${chatIdFromForm}/chat.html`)
    }

    return response.redirect(`/photo/${photoId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})
