import { postgres } from '../../dependencies/database.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { UserSentMessageToChat } from '../../events/deprecated/UserSentMessageToChat.js'
import { OnboardingUserStartedFirstThread } from '../../events/onboarding/OnboardingUserStartedFirstThread.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getUserFamilies } from '../_getUserFamilies.js'
import { getThreadComments } from '../commentApi/getThreadComments.js'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto.js'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/events/ThreadSharedWithFamilies.js'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes.js'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread.js'
import { UserSetChatTitle } from '../thread/UserSetChatTitle.js'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText.js'
import { ThreadListPageProps } from './ThreadListPage.js'
import { getThumbnails } from './getThumbnails.js'

export type ThreadEvent =
  | UserSentMessageToChat
  | OnboardingUserStartedFirstThread
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | UserSetChatTitle

export const getThreadListPageProps = async (userId: AppUserId): Promise<ThreadListPageProps> => {
  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

  type Thread = ThreadListPageProps['threads'][number]
  const threads: Thread[] = []

  const uniqueThreadsWithFamilies = new Map<ThreadId, Set<FamilyId>>()

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
        const threadId = event.payload.threadId
        if (!uniqueThreadsWithFamilies.has(threadId)) {
          uniqueThreadsWithFamilies.set(threadId, new Set())
        }
        uniqueThreadsWithFamilies.get(threadId)!.add(userFamilyId)
      }

      continue
    }

    // Get threads
    const res = await postgres.query<ThreadSharedWithFamilies>(
      `SELECT * FROM history WHERE type='ThreadSharedWithFamilies' AND payload->'familyIds' ? $1`,
      [userFamilyId]
    )

    for (const event of res.rows) {
      // Is it the most recent share event for this thread ?
      const mostRecentShareEvent = await getSingleEvent<ThreadSharedWithFamilies>('ThreadSharedWithFamilies', {
        threadId: event.payload.threadId,
      })

      if (mostRecentShareEvent!.id !== event.id) {
        continue
      }

      const threadId = event.payload.threadId
      if (!uniqueThreadsWithFamilies.has(threadId)) {
        uniqueThreadsWithFamilies.set(threadId, new Set())
      }
      uniqueThreadsWithFamilies.get(threadId)!.add(userFamilyId)
    }
  }

  for (const threadId of uniqueThreadsWithFamilies.keys()) {
    const threadEvents = await getEventList<ThreadEvent | ThreadSharedWithFamilies>(
      [
        'UserSentMessageToChat',
        'OnboardingUserStartedFirstThread',
        'UserUpdatedThreadAsRichText',
        'UserInsertedPhotoInRichTextThread',
        'UserSetChatTitle',
        'ThreadSharedWithFamilies',
      ],
      { threadId }
    )

    const threadContentEvents = threadEvents.filter((event): event is ThreadEvent => event.type !== 'ThreadSharedWithFamilies')

    const authors = await getAuthors(threadContentEvents)

    const latestEvent = threadEvents.at(-1)!

    let lastUpdatedOn = latestEvent.occurredAt.getTime()
    const threadComments = await getThreadComments({ threadId })

    const latestComment = threadComments?.at(-1)
    if (latestComment) {
      const latestCommentUpdatedOn = new Date(latestComment.dateTime).getTime()

      if (latestCommentUpdatedOn > lastUpdatedOn) {
        lastUpdatedOn = latestCommentUpdatedOn
      }
    }

    threads.push({
      threadId,
      title: getTitle(threadContentEvents),
      authors,
      contents: await getContents(threadContentEvents),
      lastUpdatedOn,
      familyIds: Array.from(uniqueThreadsWithFamilies.get(threadId)!.values()),
      thumbnails: await getThumbnails(threadContentEvents),
      commentCount: threadComments.length,
    })
  }

  return {
    threads: threads.sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn),
  }
}

async function getContents(threadEvents: readonly ThreadEvent[]): Promise<string> {
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

  if (textNodes.length) {
    const textNode = textNodes.find(
      (node) => node.content?.length && node.content.some((c) => c.type === 'text' && c.text.length)
    )

    const text = textNode?.content?.length && textNode?.content.map((c) => (c.type === 'text' ? c.text : ' ')).join('')

    if (text) {
      return text
    }
  }

  const photoNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  if (photoNodes.length) {
    const { photoId } = photoNodes[0].attrs
    const latestCaption = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId })

    if (latestCaption) {
      return latestCaption.payload.caption.body
    }
  }

  return ''
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
