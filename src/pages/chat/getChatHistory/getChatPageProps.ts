import { ChatPageProps } from '../ChatPage/ChatPage'
import { retrieveMessagesForChat } from './retrieveMessagesForChat'
import { retrievePhotosForChat } from './retrievePhotosForChat'
import { UUID } from '../../../domain'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { UserSetChatTitle } from '../UserSetChatTitle'

export const getChatPageProps = async (chatId: UUID): Promise<ChatPageProps> => {
  const photoRows = await retrievePhotosForChat(chatId)

  const messageRows = await retrieveMessagesForChat(chatId)

  const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId })

  const title = titleSet?.payload.title

  return {
    chatId,
    history: [...photoRows, ...messageRows].sort((a, b) => a.timestamp - b.timestamp),
    title: title || '',
  }
}
