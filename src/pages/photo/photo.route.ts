import multer from 'multer'
import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { getChatHistory } from '../chat/getChatHistory/getChatHistory.query'
import { getPhoto } from './getPhoto.query'
import { recognizeFacesInChatPhoto } from '../chat/recognizeFacesInChatPhoto/recognizeFacesInChatPhoto'
import { sendMessageToChat } from '../chat/sendMessageToChat/sendMessageToChat'
import { sendToOpenAIForDeductions } from '../chat/sendToOpenAIForDeductions/sendToOpenAIForDeductions'
import { uploadPhotoToChat } from '../chat/uploadPhotoToChat/uploadPhotoToChat'
import { PhotoPage } from './PhotoPage/PhotoPage'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter.route('/chat.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /chat.html`)

  const newChatId = getUuid()

  response.redirect(`/chat/${newChatId}/chat.html`)
})

pageRouter
  .route('/photo/:chatId/photo.html')
  .get(requireAuth(), async (request, response) => {
    console.log(`GET on /photo/:chatId/photo.html`)

    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const photoProps = await getPhoto(chatId)

    responseAsHtml(request, response, PhotoPage(photoProps))
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    console.log(`POST on /photo.html`)

    const userId = request.session.user!.id
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const { message } = request.body

    const { file } = request
    if (file) {
      const photoId = getUuid()

      await uploadPhotoToChat({ file, photoId, chatId, userId })

      await recognizeFacesInChatPhoto({ file, chatId, photoId })
    } else if (message) {
      const messageId = getUuid()

      // TODO: maybe write a specialized version for messages linked to photos
      await sendMessageToChat({ chatId, userId, message, messageId })

      // TODO: same, for a specific photo
      await sendToOpenAIForDeductions({ chatId, userId, message, messageId })
    }

    return response.redirect(`/photo/${chatId}/photo.html`)
  })
