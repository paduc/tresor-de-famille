import { IoTRoboRunner } from 'aws-sdk'
import multer from 'multer'
import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { addToHistory } from '../../dependencies/addToHistory'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { detectAWSFacesInChatPhoto } from '../chat/recognizeFacesInChatPhoto/detectAWSFacesInChatPhoto'
import { uploadPhotoToChat } from '../chat/uploadPhotoToChat/uploadPhotoToChat'
import { pageRouter } from '../pageRouter'
import { getPhoto } from './getPhoto.query'
import { makeDeductionsWithOpenAI } from './makeDeductionsWithOpenAI/makeDeductionsWithOpenAI'
import { PhotoPage } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter.route('/photo.html').get(requireAuth(), async (request, response) => {
  const newChatId = getUuid()

  response.redirect(`/photo/${newChatId}/photo.html`)
})

pageRouter
  .route('/photo/:chatId/photo.html')
  .get(requireAuth(), async (request, response) => {
    try {
      const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

      const photo = await getPhoto(chatId)

      responseAsHtml(request, response, PhotoPage({ photo }))
    } catch (error) {
      console.error('error', error)
      response.send(error)
    }
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    try {
      const userId = request.session.user!.id

      const { caption, photoId } = zod.object({ caption: zod.string().optional(), photoId: zIsUUID }).parse(request.body)

      const { file } = request
      if (file) {
        const photoId = getUuid()

        await uploadPhotoToChat({ file, photoId, chatId, userId })

        await detectAWSFacesInChatPhoto({ file, chatId, photoId })
      } else if (caption) {
        const captionId = getUuid()

        await addToHistory(
          UserAddedCaptionToPhoto({
            chatId,
            photoId,
            caption: {
              id: captionId,
              body: caption,
            },
            addedBy: userId,
          })
        )

        await makeDeductionsWithOpenAI({ chatId, userId, debug: false })
      }
    } catch (error) {
      console.error('Error in chat route')
      throw error
    }

    return response.redirect(`/photo/${chatId}/photo.html`)
  })

pageRouter.route('/add-photo.html').post(requireAuth(), upload.single('photo'), async (request, response) => {
  try {
    const { chatId: chatIdFromForm } = zod.object({ chatId: zIsUUID.optional() }).parse(request.body)

    const chatId = chatIdFromForm || getUuid()

    const userId = request.session.user!.id

    const { file } = request
    if (file) {
      const photoId = getUuid()

      await uploadPhotoToChat({ file, photoId, chatId, userId })

      await detectAWSFacesInChatPhoto({ file, chatId, photoId })
    }

    if (chatIdFromForm) {
      return response.redirect(`/chat/${chatIdFromForm}/chat.html`)
    }

    return response.redirect(`/photo/${chatId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})
