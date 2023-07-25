import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import * as ChatPage from './ChatPage/ChatPage'
import { getChatHistory } from './getChatHistory/getChatHistory.query'
import { UserSentMessageToChat } from './sendMessageToChat/UserSentMessageToChat'
import { addToHistory } from '../../dependencies/addToHistory'

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

pageRouter
  .route('/chat.html')
  .get(requireAuth(), async (request, response) => {
    const newChatId = getUuid()

    response.redirect(`/chat/${newChatId}/chat.html`)
  })
  .post(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id

    const chatId = getUuid()

    const { message } = request.body

    if (message) {
      const messageId = getUuid()

      await addToHistory(
        UserSentMessageToChat({
          chatId,
          userId,
          message,
          messageId,
        })
      )
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(`/chat/${chatId}/chat.html`)
  })

pageRouter
  .route('/chat/:chatId/chat.html')
  .get(requireAuth(), async (request, response) => {
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const history: ChatPage.ChatPageProps['history'] = await getChatHistory(chatId)

    responseAsHtml(
      request,
      response,
      ChatPage.ChatPage({
        history,
        chatId,
      })
    )
  })
  .post(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id
    const { chatId } = zod.object({ chatId: zIsUUID }).parse(request.params)

    const { message } = request.body

    if (message) {
      const messageId = getUuid()

      await addToHistory(
        UserSentMessageToChat({
          chatId,
          userId,
          message,
          messageId,
        })
      )
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(`/chat/${chatId}/chat.html`)
  })
