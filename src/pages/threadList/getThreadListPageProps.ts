import { ThumbnailURL } from '../../actions/ThumbnailURL'
import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadId } from '../../domain/ThreadId'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { getUserFamilies } from '../_getUserFamilies'
import { ThreadClonedForSharing } from '../thread/ThreadPage/ThreadClonedForSharing'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../thread/sendMessageToChat/UserSentMessageToChat'
import { ThreadListPageProps } from './ThreadListPage'

type ThreadEvent =
  | UserSentMessageToChat
  | OnboardingUserStartedFirstThread
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | ThreadClonedForSharing
  | UserSetChatTitle

export const getThreadListPageProps = async (userId: AppUserId): Promise<ThreadListPageProps> => {
  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)
  userFamilyIds.push(userId as string as FamilyId)

  type Thread = ThreadListPageProps['threads'][number]
  const threads: Thread[] = []

  for (const userFamilyId of userFamilyIds) {
    // Get threads

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

      // TODO: Get author from first event (maybe there should be multiple authors?)

      const latestEvent = threadEvents.at(-1)!

      threads.push({
        threadId,
        title: getTitle(threadEvents),
        author: {
          name: '',
        },
        lastUpdatedOn: latestEvent.occurredAt.getTime(),
        familyId: userFamilyId,
        thumbnails: getThumbnails(threadEvents),
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

function getThumbnails(threadEvents: readonly ThreadEvent[]): string[] {
  const latestContentEvent = [...threadEvents]
    .reverse()
    .find(
      (event: ThreadEvent): event is UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread | ThreadClonedForSharing =>
        ['UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread', 'ThreadClonedForSharing'].includes(event.type)
    )

  if (!latestContentEvent) return []

  const nodes = latestContentEvent.payload.contentAsJSON.content

  const imageNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  return imageNodes.map((node) => node.attrs.photoId).map((photoId) => ThumbnailURL(photoId))
}

function getTitle(threadEvents: readonly ThreadEvent[]): string | undefined {
  const titleEvent = [...threadEvents]
    .reverse()
    .find(
      (event: ThreadEvent): event is ThreadClonedForSharing | UserSetChatTitle =>
        event.type === 'ThreadClonedForSharing' || event.type === 'UserSetChatTitle'
    )

  if (titleEvent?.payload.title) {
    return titleEvent.payload.title
  }
}
