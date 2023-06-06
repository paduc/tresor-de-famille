import { ChatPageProps } from '../ChatPage/ChatPage'
import { retrieveMessagesForChat } from './retrieveMessagesForChat'
import { retrievePhotosForChat } from './retrievePhotosForChat'
import { UUID } from '../../../domain'

export const getChatHistory = async (chatId: UUID): Promise<ChatPageProps['history']> => {
  const photoRows = await retrievePhotosForChat(chatId)

  const messageRows = await retrieveMessagesForChat(chatId)

  return [...photoRows, ...messageRows].sort((a, b) => a.timestamp - b.timestamp)
}
