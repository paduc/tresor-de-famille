import { postgres } from '../../../dependencies/database'
import { getProfilePicUrlForUser } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { ChatEvent } from '../ChatPage/ChatPage'
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'

export async function retrieveMessagesForChat(chatId: UUID) {
  const { rows: messageRowsRes } = await postgres.query<UserSentMessageToChat>(
    "SELECT * FROM history WHERE type='UserSentMessageToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const messageRows = messageRowsRes.map(({ occurredAt, payload: { sentBy, message } }): ChatEvent & { type: 'message' } => ({
    type: 'message',
    timestamp: occurredAt.getTime(),
    profilePicUrl: getProfilePicUrlForUser(sentBy),
    message: {
      body: message,
    },
  }))
  return messageRows
}
