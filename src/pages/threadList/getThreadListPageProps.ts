import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../thread/sendMessageToChat/UserSentMessageToChat'
import { ThreadListPageProps } from './ThreadListPage'

export const getThreadListPageProps = async (userId: AppUserId): Promise<ThreadListPageProps> => {
  type MessageEvent =
    | UserSentMessageToChat
    | OnboardingUserStartedFirstThread
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread

  const messagesEvents = await getEventList<MessageEvent>(
    [
      'OnboardingUserStartedFirstThread',
      'UserSentMessageToChat',
      'UserUpdatedThreadAsRichText',
      'UserInsertedPhotoInRichTextThread',
    ],
    { userId }
  )

  // const userUploadedEvents = await getEventList<UserUploadedPhotoToChat>('UserUploadedPhotoToChat', { uploadedBy: userId })

  // type ThreadEvent = MessageEvent | UserUploadedPhotoToChat
  type ThreadEvent = MessageEvent
  const threadEvents: ThreadEvent[] = messagesEvents

  const uniqueThreads = new Map<ThreadId, ThreadEvent[]>()
  for (const threadEvent of threadEvents) {
    const threadId =
      threadEvent.type === 'OnboardingUserStartedFirstThread' ? threadEvent.payload.threadId : threadEvent.payload.chatId

    if (!uniqueThreads.has(threadId)) {
      uniqueThreads.set(threadId, [])
    }

    uniqueThreads.get(threadId)!.push(threadEvent)
  }

  const titleForThreadId = new Map<ThreadId, string | undefined>()
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

          title = firstMessage ? firstMessage.payload.message : 'Fil sans titre'
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
