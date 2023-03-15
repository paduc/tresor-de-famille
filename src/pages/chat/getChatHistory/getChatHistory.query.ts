import { ChatPageProps } from '../ChatPage/ChatPage'
import { retrieveMessagesForChat } from './retrieveMessagesForChat'
import { retrieveDeductionsForChat } from './retrieveDeductionsForChat'
import { retrievePhotosForChat } from './retrievePhotosForChat/retrievePhotosForChat'

export const getChatHistory = async (chatId: string): Promise<ChatPageProps['history']> => {
  const photoRows = await retrievePhotosForChat(chatId)

  const messageRows = await retrieveMessagesForChat(chatId)

  const deductionsRows = await retrieveDeductionsForChat(chatId)

  return [...photoRows, ...messageRows, ...deductionsRows].sort((a, b) => a.timestamp - b.timestamp)
}
