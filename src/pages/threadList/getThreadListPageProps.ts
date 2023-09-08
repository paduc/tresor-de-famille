import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UUID } from '../../domain'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserSetChatTitle } from '../chat/UserSetChatTitle'
import { UserSentMessageToChat } from '../chat/sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { ThreadListPageProps } from './ThreadListPage'

export const getThreadListPageProps = async (userId: UUID): Promise<ThreadListPageProps> => {
  const messagesEvents = await getEventList<UserSentMessageToChat | OnboardingUserStartedFirstThread>(
    ['OnboardingUserStartedFirstThread', 'UserSentMessageToChat'],
    { userId }
  )

  const userUploadedEvents = await getEventList<UserUploadedPhotoToChat>('UserUploadedPhotoToChat', { uploadedBy: userId })

  const threadEvents = [...messagesEvents, ...userUploadedEvents]

  const uniqueThreads = new Map<UUID, (UserSentMessageToChat | OnboardingUserStartedFirstThread | UserUploadedPhotoToChat)[]>()
  for (const threadEvent of threadEvents) {
    const threadId =
      threadEvent.type === 'OnboardingUserStartedFirstThread' ? threadEvent.payload.threadId : threadEvent.payload.chatId

    if (!uniqueThreads.has(threadId)) {
      uniqueThreads.set(threadId, [])
    }

    uniqueThreads.get(threadId)!.push(threadEvent)
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
    threads: Array.from(uniqueThreads.entries())
      .map(([threadId, rows]) => {
        const latestRow = rows.at(-1)!

        let title = titleForThreadId.get(threadId)

        if (!title) {
          const firstMessage = rows.find(
            (row): row is OnboardingUserStartedFirstThread | UserSentMessageToChat =>
              row.type === 'OnboardingUserStartedFirstThread' || row.type === 'UserSentMessageToChat'
          )

          title = firstMessage ? firstMessage.payload.message : 'Photo sans titre'
        }

        return {
          threadId,
          title,
          lastUpdatedOn: latestRow.occurredAt.getTime(),
        }
      })
      .sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}
