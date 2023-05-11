import { postgres } from '../../dependencies/database'
import { UUID } from '../../domain'
import { UserSentMessageToChat } from '../chat/sendMessageToChat/UserSentMessageToChat'

export const getThreads = async (userId: UUID): Promise<{ chatId: UUID; title: string }[]> => {
  const { rows } = await postgres.query<UserSentMessageToChat>(
    "SELECT * FROM history WHERE type = 'UserSentMessageToChat' AND payload->>'sentBy'=$1",
    [userId]
  )

  return rows.map((row) => ({
    chatId: row.payload.chatId,
    title: row.payload.message,
  }))
}
