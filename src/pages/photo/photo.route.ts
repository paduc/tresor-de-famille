import multer from 'multer'
import zod from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { uploadPhotoToChat } from '../chat/uploadPhotoToChat/uploadPhotoToChat'
import { pageRouter } from '../pageRouter'
import { PhotoPage } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { getPhoto } from './getPhoto.query'
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
      const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)

      const photo = await getPhoto(photoId)

      responseAsHtml(request, response, PhotoPage({ ...photo }))
    } catch (error) {
      console.error('error', error)
      response.send(error)
    }
  })
  .post(requireAuth(), async (request, response) => {
    try {
      const userId = request.session.user!.id

      const { caption, photoId } = zod.object({ caption: zod.string().optional(), photoId: zIsUUID }).parse(request.body)

      if (caption) {
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

        // await makeDeductionsWithOpenAI({ userId, debug: false })
      }

      return response.redirect(`/photo/${photoId}/photo.html`)
    } catch (error) {
      console.error('Error in chat route')
      throw error
    }
  })

pageRouter.route('/add-photo.html').post(requireAuth(), upload.single('photo'), async (request, response) => {
  try {
    const { chatId: chatIdFromForm } = zod.object({ chatId: zIsUUID.optional() }).parse(request.body)

    const chatId = chatIdFromForm || getUuid()

    const userId = request.session.user!.id

    const { file } = request

    if (!file) return new Error('We did not receive any image.')
    const photoId = getUuid()

    await uploadPhotoToChat({ file, photoId, chatId, userId })

    await detectFacesInPhotoUsingAWS({ file, chatId, photoId })

    if (chatIdFromForm) {
      return response.redirect(`/chat/${chatIdFromForm}/chat.html`)
    }

    return response.redirect(`/photo/${photoId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})
