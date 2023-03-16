import { publish } from '../../../dependencies/eventStore'
import { UUID } from '../../../domain'
import { UserSentMessageToChat } from './UserSentMessageToChat'

type SendMessageToChatArgs = {
  messageId: UUID
  chatId: UUID
  userId: UUID
  message: string
}
export async function sendMessageToChat({ messageId, chatId, userId, message }: SendMessageToChatArgs) {
  await publish(
    UserSentMessageToChat({
      chatId,
      sentBy: userId,
      message,
      messageId,
    })
  )
  return messageId
}
