import { message } from 'aws-sdk/clients/sns'
import { postgres } from '../../../dependencies/database'
import { getProfilePicUrlForUser } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { ChatEvent } from '../ChatPage/ChatPage'
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'

type ChatMessageItem = ChatEvent & {
  type: message
}

export async function retrieveMessagesForChat(chatId: UUID): Promise<ChatMessageItem[]> {
  const { rows: messageRowsRes } = await postgres.query<UserSentMessageToChat>(
    "SELECT * FROM history WHERE type='UserSentMessageToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const messageRows = messageRowsRes.map(({ occurredAt, payload: { sentBy, message } }): ChatEvent & { type: 'message' } => ({
    type: 'message',
    timestamp: occurredAt.getTime(),
    message: {
      body: message,
    },
  }))
  return messageRows
}
