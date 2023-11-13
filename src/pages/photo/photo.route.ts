import multer from 'multer'
import zod, { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { UUID, zIsUUID } from '../../domain'
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
import { PhotoListPageUrl } from '../listPhotos/PhotoListPageUrl'
import { UserDeletedPhoto } from './UserDeletedPhoto'
import { doesPhotoExist } from '../_doesPhotoExist'
import { zIsFaceId } from '../../domain/FaceId'
import { makePersonId } from '../../libs/makePersonId'
import { zIsPersonId } from '../../domain/PersonId'

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

      const { threadId, profileId, updated } = z
        .object({ threadId: zIsUUID.optional(), profileId: zIsPersonId.optional(), updated: z.string().optional() })
        .parse(request.query)

      const props = await getNewPhotoPageProps({ photoId, userId: request.session.user!.id })

      if (threadId) {
        props.context = { type: 'thread', threadId }
      }

      if (profileId) {
        props.context = { type: 'profile', profileId }
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
              faceId: zIsFaceId,
              newFamilyMemberName: z.string().optional(),
            })
            .parse(request.body)

          if (newFamilyMemberName && newFamilyMemberName.length > 0) {
            const personId = makePersonId()
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
    const { chatId: chatIdFromForm, isOnboarding } = zod
      .object({ chatId: z.union([zIsUUID.optional(), z.string()]), isOnboarding: zod.string().optional() })
      .parse(request.body)

    const chatId = !chatIdFromForm || chatIdFromForm === 'new' ? getUuid() : (chatIdFromForm as UUID)

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
      return response.redirect(`/chat/${chatId}/chat.html`)
    }

    return response.redirect(`/photo/${photoId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})

pageRouter.route('/delete-photo').post(requireAuth(), async (request, response) => {
  try {
    const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.body)
    const userId = request.session.user!.id

    // Make sure the user is the author of the photo
    const isAllowed = await doesPhotoExist({ photoId, userId })

    if (!isAllowed) {
      return response.status(403).send("La suppression de la photo a échoué parce que vous n'en êtes pas l'auteur.")
    }

    // Emit
    await addToHistory(UserDeletedPhoto({ photoId, userId }))

    return response.redirect(PhotoListPageUrl)
  } catch (error) {
    console.error('Error in photo route')
    return response.status(500).send('La suppression de la photo a échoué.')
  }
})
