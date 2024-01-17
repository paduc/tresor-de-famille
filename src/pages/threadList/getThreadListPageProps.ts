import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'
import { UserSentMessageToChat } from '../../events/deprecated/UserSentMessageToChat'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { getPersonForUser } from '../_getPersonForUser'
import { getUserFamilies } from '../_getUserFamilies'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../thread/UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'
import { ThreadListPageProps } from './ThreadListPage'

type ThreadEvent =
  | UserSentMessageToChat
  | OnboardingUserStartedFirstThread
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | UserSetChatTitle

export const getThreadListPageProps = async (userId: AppUserId): Promise<ThreadListPageProps> => {
  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

  type Thread = ThreadListPageProps['threads'][number]
  const threads: Thread[] = []

  for (const userFamilyId of userFamilyIds) {
    // Get threads

    const threadEvents = await getEventList<ThreadEvent>(
      [
        'UserSentMessageToChat',
        'OnboardingUserStartedFirstThread',
        'UserUpdatedThreadAsRichText',
        'UserInsertedPhotoInRichTextThread',
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
      const authors = await getAuthors(threadEvents)

      const latestEvent = threadEvents.at(-1)!

      threads.push({
        threadId,
        title: getTitle(threadEvents),
        authors,
        contents: getContents(threadEvents),
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

function getThumbnails(threadEvents: readonly ThreadEvent[]): string[] {
  const latestContentEvent = [...threadEvents]
    .reverse()
    .find((event: ThreadEvent): event is UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread =>
      ['UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'].includes(event.type)
    )

  if (!latestContentEvent) return []

  const nodes = latestContentEvent.payload.contentAsJSON.content

  const imageNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  return imageNodes.map((node) => node.attrs.photoId).map((photoId) => ThumbnailURL(photoId))
}

function getContents(threadEvents: readonly ThreadEvent[]): string {
  const latestContentEvent = [...threadEvents]
    .reverse()
    .find(
      (
        event: ThreadEvent
      ): event is
        | OnboardingUserStartedFirstThread
        | UserSentMessageToChat
        | UserUpdatedThreadAsRichText
        | UserInsertedPhotoInRichTextThread =>
        [
          'OnboardingUserStartedFirstThread',
          'UserSentMessageToChat',
          'UserUpdatedThreadAsRichText',
          'UserInsertedPhotoInRichTextThread',
          ,
        ].includes(event.type)
    )

  if (!latestContentEvent) return ''

  if (latestContentEvent.type === 'OnboardingUserStartedFirstThread') {
    return latestContentEvent.payload.message
  }

  if (latestContentEvent.type === 'UserSentMessageToChat') {
    return latestContentEvent.payload.message
  }

  const nodes = latestContentEvent.payload.contentAsJSON.content

  const textNodes = nodes.filter((node): node is ParagraphNode => node.type === 'paragraph' && !!node.content)

  return textNodes.map((node) => (node.content?.length ? node.content[0].text : '')).join('\n')
}

function getTitle(threadEvents: readonly ThreadEvent[]): string | undefined {
  const titleEvent = [...threadEvents]
    .reverse()
    .find((event: ThreadEvent): event is UserSetChatTitle => event.type === 'UserSetChatTitle')

  if (titleEvent?.payload.title) {
    return titleEvent.payload.title
  }
}

async function getAuthors(threadEvents: readonly ThreadEvent[]): Promise<{ name: string }[]> {
  const editorIds = new Set(threadEvents.map((event) => event.payload.userId))

  const editorsOrNull = await Promise.all(Array.from(editorIds).map((editorId) => getPersonForUser({ userId: editorId })))

  const editors = editorsOrNull.filter((person): person is Exclude<typeof editorsOrNull[number], null> => !!person)

  return editors.map(({ name }) => ({ name }))
}
