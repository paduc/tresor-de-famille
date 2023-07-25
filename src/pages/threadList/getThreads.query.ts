import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UUID } from '../../domain'
import { OnboardingUserStartedFirstThread } from '../bienvenue/step4-start-thread/OnboardingUserStartedFirstThread'
import { UserSetChatTitle } from '../chat/UserSetChatTitle'
import { UserSentMessageToChat } from '../chat/sendMessageToChat/UserSentMessageToChat'
import { ThreadListPageProps } from './ThreadListPage'

export const getThreadListPageProps = async (userId: UUID): Promise<ThreadListPageProps> => {
  const threads = await getEventList<UserSentMessageToChat | OnboardingUserStartedFirstThread>(
    ['OnboardingUserStartedFirstThread', 'UserSentMessageToChat'],
    { userId }
  )

  const uniqueThreads = new Map<UUID, UserSentMessageToChat | OnboardingUserStartedFirstThread>()
  for (const thread of threads) {
    if (thread.type === 'OnboardingUserStartedFirstThread') {
      uniqueThreads.set(thread.payload.threadId, thread)
    } else {
      uniqueThreads.set(thread.payload.chatId, thread)
    }
  }

  const titleForThreadId = new Map<UUID, string | undefined>()
  for (const uniqueThreadId of uniqueThreads.keys()) {
    const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: uniqueThreadId })

    const lastSetTitle = titleSet?.payload.title
    if (lastSetTitle?.length) {
      titleForThreadId.set(uniqueThreadId, lastSetTitle)
    } else {
      titleForThreadId.delete(uniqueThreadId)
    }
  }

  return {
    threads: Array.from(uniqueThreads.values())
      .map((row) => {
        const threadId = row.type === 'OnboardingUserStartedFirstThread' ? row.payload.threadId : row.payload.chatId
        return {
          chatId: threadId,
          title: titleForThreadId.get(threadId) || row.payload.message,
          lastUpdatedOn: row.occurredAt.getTime(),
        }
      })
      .sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}
