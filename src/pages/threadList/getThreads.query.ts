import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { UUID } from '../../domain'
import { OnboardingUserStartedFirstThread } from '../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
import { UserSentMessageToChat } from '../chat/sendMessageToChat/UserSentMessageToChat'

export const getThreads = async (userId: UUID): Promise<{ chatId: UUID; title: string }[]> => {
  const threads = await getEventList<UserSentMessageToChat | OnboardingUserStartedFirstThread>(
    ['OnboardingUserStartedFirstThread', 'UserSentMessageToChat'],
    { userId }
  )

  return threads.map((row) => {
    const threadId = row.type === 'OnboardingUserStartedFirstThread' ? row.payload.threadId : row.payload.chatId
    return {
      chatId: threadId,
      title: row.payload.message,
    }
  })
}
