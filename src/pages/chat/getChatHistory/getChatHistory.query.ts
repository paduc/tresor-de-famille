import { ChatPageProps } from '../ChatPage/ChatPage'
import { retrieveMessagesForChat } from './retrieveMessagesForChat'
import { retrievePhotosForChat } from './retrievePhotosForChat/retrievePhotosForChat'

export const getChatHistory = async (chatId: string): Promise<ChatPageProps['history']> => {
  const photoRows = await retrievePhotosForChat(chatId)

  const messageRows = await retrieveMessagesForChat(chatId)

  // TODO : add an event in the chat history to display the deduction
  // DANGER: trying to reuse the deductions query for both => do the query twice to keep decoupled !

  return [...photoRows, ...messageRows].sort((a, b) => a.timestamp - b.timestamp)
}
