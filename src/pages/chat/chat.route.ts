import z from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsUUID } from '../../domain'
import { getUuid } from '../../libs/getUuid'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ChatPage } from './ChatPage/ChatPage'
import { getChatPageProps } from './getChatHistory/getChatPageProps'
import { UserSentMessageToChat } from './sendMessageToChat/UserSentMessageToChat'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserSetChatTitle } from './UserSetChatTitle'

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
    const { chatId } = z.object({ chatId: zIsUUID }).parse(request.params)

    const props = await getChatPageProps(chatId)

    responseAsHtml(request, response, ChatPage(props))
  })
  .post(requireAuth(), async (request, response) => {
    const userId = request.session.user!.id
    const { chatId } = z.object({ chatId: zIsUUID }).parse(request.params)

    const { action } = z.object({ action: z.enum(['setTitle', 'newMessage']) }).parse(request.body)

    if (action === 'newMessage') {
      const { message } = z.object({ message: z.string() }).parse(request.body)
      const messageId = getUuid()

      await addToHistory(
        UserSentMessageToChat({
          chatId,
          userId,
          message,
          messageId,
        })
      )
    } else if (action === 'setTitle') {
      const { title } = z.object({ title: z.string() }).parse(request.body)

      await addToHistory(
        UserSetChatTitle({
          chatId,
          userId,
          title,
        })
      )
    }

    // TODO: try catch error and send it back as HTML (or redirect if OK)
    return response.redirect(`/chat/${chatId}/chat.html`)
  })
