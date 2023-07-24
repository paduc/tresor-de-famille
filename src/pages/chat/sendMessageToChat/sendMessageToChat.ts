import { addToHistory } from '../../../dependencies/addToHistory'
import { UUID } from '../../../domain'
import { UserSentMessageToChat } from './UserSentMessageToChat'

type SendMessageToChatArgs = {
  messageId: UUID
  chatId: UUID
  userId: UUID
  message: string
}
export async function sendMessageToChat({ messageId, chatId, userId, message }: SendMessageToChatArgs) {
  await addToHistory(
    UserSentMessageToChat({
      chatId,
      userId,
      message,
      messageId,
    })
  )
  return messageId
}
