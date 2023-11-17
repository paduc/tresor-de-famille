import multer from 'multer'
import zod, { z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { personsIndex } from '../../dependencies/search'
import { zIsFaceId } from '../../domain/FaceId'
import { zIsPersonId } from '../../domain/PersonId'
import { zIsPhotoId } from '../../domain/PhotoId'
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
import { uploadPhotoToChat } from '../thread/uploadPhotoToChat/uploadPhotoToChat'
import { PhotoListPageUrl } from '../photoList/PhotoListPageUrl'
import { pageRouter } from '../pageRouter'
import { NewPhotoPage } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { UserDeletedPhoto } from './UserDeletedPhoto'
import { getNewPhotoPageProps } from './getNewPhotoPageProps'
import { detectFacesInPhotoUsingAWS } from './recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'

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

      const { threadId, profileId, updated } = z
        .object({ threadId: zIsThreadId.optional(), profileId: zIsPersonId.optional(), updated: z.string().optional() })
        .parse(request.query)

      const props = await getNewPhotoPageProps({
        photoId,
        userId: request.session.user!.id,
        familyId: request.session.currentFamilyId!,
      })

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
        const currentFamilyId = request.session.currentFamilyId!
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
              familyId: currentFamilyId,
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
                familyId: currentFamilyId,
              })
            )

            try {
              await personsIndex.saveObject({
                objectID: personId,
                personId,
                name: newFamilyMemberName,
                visible_by: [`family/${currentFamilyId}`, `user/${userId}`],
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
                familyId: currentFamilyId,
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
              familyId: currentFamilyId,
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
      .object({ chatId: z.union([zIsThreadId.optional(), z.string()]), isOnboarding: zod.string().optional() })
      .parse(request.body)

    const chatId = !chatIdFromForm || chatIdFromForm === 'new' ? makeThreadId() : (chatIdFromForm as ThreadId)

    const userId = request.session.user!.id

    const { file } = request

    if (!file) return new Error('We did not receive any image.')
    const photoId = makePhotoId()

    await uploadPhotoToChat({ file, photoId, chatId, userId, familyId: request.session.currentFamilyId! })

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
    const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.body)
    const userId = request.session.user!.id
    const familyId = request.session.currentFamilyId!

    // Make sure the user is the author of the photo
    const isAllowed = await doesPhotoExist({ photoId, familyId })

    if (!isAllowed) {
      return response.status(403).send("La suppression de la photo a échoué parce que vous n'en êtes pas l'auteur.")
    }

    // Emit
    await addToHistory(
      UserDeletedPhoto({
        photoId,
        userId,
        familyId,
      })
    )

    return response.redirect(PhotoListPageUrl)
  } catch (error) {
    console.error('Error in photo route')
    return response.status(500).send('La suppression de la photo a échoué.')
  }
})
