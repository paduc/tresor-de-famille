import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadId } from '../../domain/ThreadId'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { getUserFamilies } from '../_getUserFamilies'
import { ThreadClonedForSharing } from '../thread/ThreadPage/ThreadClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../thread/sendMessageToChat/UserSentMessageToChat'
import { ThreadListPageProps } from './ThreadListPage'

export const getThreadListPageProps = async (userId: AppUserId): Promise<ThreadListPageProps> => {
  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)
  userFamilyIds.push(userId as string as FamilyId)

  type Thread = ThreadListPageProps['threads'][number]
  const threads: Thread[] = []
  const clonedThreadIds = new Set<ThreadId>()

  for (const userFamilyId of userFamilyIds) {
    // Get threads

    type ThreadEvent =
      | UserSentMessageToChat
      | OnboardingUserStartedFirstThread
      | UserUpdatedThreadAsRichText
      | UserInsertedPhotoInRichTextThread
      | ThreadClonedForSharing

    const threadEvents = await getEventList<ThreadEvent>(
      [
        'OnboardingUserStartedFirstThread',
        'UserSentMessageToChat',
        'UserUpdatedThreadAsRichText',
        'UserInsertedPhotoInRichTextThread',
        'ThreadClonedForSharing',
      ],
      { familyId: userFamilyId }
    )

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

    for (const [threadId, threadEvents] of uniqueThreads.entries()) {
      const cloneEvent = threadEvents.find(
        (event: ThreadEvent): event is ThreadClonedForSharing => event.type === 'ThreadClonedForSharing'
      )
      if (cloneEvent) {
        // Keep a list of all the threads that have been cloned (ie shared)
        clonedThreadIds.add(cloneEvent.payload.clonedFrom.threadId)
      }

      const title =
        (await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: threadId }))?.payload.title ||
        cloneEvent?.payload.title ||
        'Fil sans titre'

      const latestEvent = threadEvents.at(-1)!

      threads.push({
        threadId,
        title,
        lastUpdatedOn: latestEvent.occurredAt.getTime(),
        familyId: userFamilyId,
      })
    }
  }

  // Hide cloned threads
  return {
    threads: threads.filter(({ threadId }) => !clonedThreadIds.has(threadId)).sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}
