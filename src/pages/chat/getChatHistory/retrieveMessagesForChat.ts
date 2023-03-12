import { postgres } from '../../../dependencies/postgres'
import { getProfilePicUrlForUser } from '../../../dependencies/uploadPhoto'
import { ChatEvent } from '../ChatPage'
import { UserSentMessageToChat } from '../UserSentMessageToChat'

export async function retrieveMessagesForChat(chatId: string) {
  const { rows: messageRowsRes } = await postgres.query<UserSentMessageToChat>(
    "SELECT * FROM events WHERE type='UserSentMessageToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const messageRows = messageRowsRes.map(({ occurredAt, payload: { sentBy, message } }): ChatEvent & { type: 'message' } => ({
    type: 'message',
    timestamp: occurredAt,
    profilePicUrl: getProfilePicUrlForUser(sentBy),
    message: {
      body: message,
    },
  }))
  return messageRows
}
