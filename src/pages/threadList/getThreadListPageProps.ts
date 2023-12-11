import { postgres } from '../../dependencies/database'
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

  for (const userFamilyId of userFamilyIds) {
    // Get threads

    type ThreadEvent =
      | UserSentMessageToChat
      | OnboardingUserStartedFirstThread
      | UserUpdatedThreadAsRichText
      | UserInsertedPhotoInRichTextThread
      | ThreadClonedForSharing
      | UserSetChatTitle

    const threadEvents = await getEventList<ThreadEvent>(
      [
        'OnboardingUserStartedFirstThread',
        'UserSentMessageToChat',
        'UserUpdatedThreadAsRichText',
        'UserInsertedPhotoInRichTextThread',
        'ThreadClonedForSharing',
        'UserSetChatTitle',
      ],
      { familyId: userFamilyId }
    )

    const uniqueThreads = new Map<ThreadId, ThreadEvent[]>()
    for (const threadEvent of threadEvents) {
      const { threadId } = threadEvent.payload

      if (!uniqueThreads.has(threadId)) {
        uniqueThreads.set(threadId, [])
      }

      uniqueThreads.get(threadId)!.push(threadEvent)
    }

    const threadsArr = Array.from(uniqueThreads.entries())
    for (const [threadId, threadEvents] of threadsArr) {
      const hasClones = await doesThreadHaveClones(threadId)
      if (hasClones) {
        // Hide all threads that have been cloned (shared in another family)
        continue
      }

      const titleEvent = threadEvents.find(
        (event: ThreadEvent): event is ThreadClonedForSharing | UserSetChatTitle =>
          event.type === 'ThreadClonedForSharing' || event.type === 'UserSetChatTitle'
      )
      const title = titleEvent?.payload.title || 'Fil sans titre'

      const latestEvent = threadEvents.at(-1)!

      threads.push({
        threadId,
        title,
        lastUpdatedOn: latestEvent.occurredAt.getTime(),
        familyId: userFamilyId,
      })
    }
  }

  return {
    threads: threads.sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}

async function doesThreadHaveClones(threadId: ThreadId): Promise<boolean> {
  const { rows } = await postgres.query(
    `SELECT count(*) FROM history WHERE type='ThreadClonedForSharing' AND payload->'clonedFrom'->>'threadId'=$1 LIMIT 1;`,
    [threadId]
  )

  const count = Number(rows[0].count)

  return count > 0
}
