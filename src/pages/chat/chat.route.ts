import multer from 'multer'
import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ChatPage, ChatPageProps } from './ChatPage/ChatPage'
import { getChatHistory } from './getChatHistory/getChatHistory.query'
import { detectAWSFacesInChatPhoto } from './recognizeFacesInChatPhoto/detectAWSFacesInChatPhoto'
import { sendMessageToChat } from './sendMessageToChat/sendMessageToChat'
import { sendToOpenAIForDeductions } from './sendToOpenAIForDeductions/sendToOpenAIForDeductions'
import { uploadPhotoToChat } from './uploadPhotoToChat/uploadPhotoToChat'

const FILE_SIZE_LIMIT_MB = 50
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter.route('/chat.html').get(requireAuth(), async (request, response) => {
  const newChatId = getUuid()

  response.redirect(`/chat/${newChatId}/chat.html`)
})

pageRouter
  .route('/chat/:chatId/chat.html')
  .get(requireAuth(), async (request, response) => {
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const history: ChatPageProps['history'] = await getChatHistory(chatId)

    responseAsHtml(
      request,
      response,
      ChatPage({
        history,
        userProfilePicUrl: fakeProfilePicUrl,
      })
    )
  })
  .post(requireAuth(), upload.single('photo'), async (request, response) => {
    const userId = request.session.user!.id
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const { message } = request.body

    const { file } = request
    if (file) {
      const photoId = getUuid()

      await uploadPhotoToChat({ file, photoId, chatId, userId })

      await detectAWSFacesInChatPhoto({ file, chatId, photoId })
    } else if (message) {
      const messageId = getUuid()

      await sendMessageToChat({ chatId, userId, message, messageId })

      await sendToOpenAIForDeductions({ chatId, userId, message, messageId })
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(`/chat/${chatId}/chat.html`)

    const history: ChatPageProps['history'] = await getChatHistory(chatId)

    responseAsHtml(
      request,
      response,
      ChatPage({
        history,
        userProfilePicUrl: fakeProfilePicUrl,
      })
    )
  })
