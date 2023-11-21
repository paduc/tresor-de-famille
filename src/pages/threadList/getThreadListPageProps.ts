import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { ThreadClonedForSharing } from '../thread/ThreadPage/ThreadClonedForSharing'
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
    | ThreadClonedForSharing

  const messagesEvents = await getEventList<MessageEvent>(
    [
      'OnboardingUserStartedFirstThread',
      'UserSentMessageToChat',
      'UserUpdatedThreadAsRichText',
      'UserInsertedPhotoInRichTextThread',
      'ThreadClonedForSharing',
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
      threadEvent.type === 'OnboardingUserStartedFirstThread'
        ? threadEvent.payload.threadId
        : threadEvent.type === 'ThreadClonedForSharing'
        ? threadEvent.payload.threadId
        : threadEvent.payload.chatId

    if (!uniqueThreads.has(threadId)) {
      uniqueThreads.set(threadId, [])
    }

    uniqueThreads.get(threadId)!.push(threadEvent)
  }

  const titleForThreadId = new Map<ThreadId, string | undefined>()
  const familyInfoForThreadId = new Map<ThreadId, { name: string | undefined }>()
  for (const [uniqueThreadId, messages] of uniqueThreads.entries()) {
    const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: uniqueThreadId })

    const lastSetTitle = titleSet?.payload.title
    if (lastSetTitle?.length) {
      titleForThreadId.set(uniqueThreadId, lastSetTitle)
    } else {
      titleForThreadId.delete(uniqueThreadId)
    }

    const familyEvent = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', {
      familyId: messages[0].payload.familyId,
    })

    if (familyEvent) {
      familyInfoForThreadId.set(uniqueThreadId, { name: familyEvent?.payload.familyName || 'Famille sans nom' })
    } else {
      familyInfoForThreadId.set(uniqueThreadId, { name: undefined })
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

        const familyInfo = familyInfoForThreadId.get(threadId)
        const name = familyInfo && familyInfo.name

        return {
          threadId,
          title,
          lastUpdatedOn: latestRow.occurredAt.getTime(),
          family: {
            familyId: latestRow.payload.familyId,
            name,
          },
        }
      })
      .sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}
