import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'
import { UserSentMessageToChat } from '../../events/deprecated/UserSentMessageToChat'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread'
import { asFamilyId } from '../../libs/typeguards'
import { getPersonForUser } from '../_getPersonForUser'
import { getUserFamilies } from '../_getUserFamilies'
import { ThumbnailURL } from '../photoApi/ThumbnailURL'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/ThreadSharedWithFamilies'
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

  const uniqueThreadIds = new Set<ThreadId>()

  for (const userFamilyId of userFamilyIds) {
    if (userFamilyId === asFamilyId(userId)) {
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

      for (const event of threadEvents) {
        uniqueThreadIds.add(event.payload.threadId)
      }

      continue
    }

    // Get threads
    const res = await postgres.query<ThreadSharedWithFamilies>(
      `SELECT * FROM history WHERE type='ThreadSharedWithFamilies' AND payload->'familyIds' ? $1`,
      [userFamilyId]
    )

    for (const event of res.rows) {
      uniqueThreadIds.add(event.payload.threadId)
    }
  }

  for (const threadId of uniqueThreadIds) {
    const threadEvents = await getEventList<ThreadEvent>(
      [
        'UserSentMessageToChat',
        'OnboardingUserStartedFirstThread',
        'UserUpdatedThreadAsRichText',
        'UserInsertedPhotoInRichTextThread',
        'UserSetChatTitle',
      ],
      { threadId }
    )

    const authors = await getAuthors(threadEvents)

    const latestEvent = threadEvents.at(-1)!

    threads.push({
      threadId,
      title: getTitle(threadEvents),
      authors,
      contents: getContents(threadEvents),
      lastUpdatedOn: latestEvent.occurredAt.getTime(),
      familyId: threadEvents.at(0)!.payload.familyId,
      thumbnails: getThumbnails(threadEvents),
    })
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
