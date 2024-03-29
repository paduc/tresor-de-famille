import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getEventList } from './dependencies/getEventList.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { FamilyId } from './domain/FamilyId.js'
import { PhotoId } from './domain/PhotoId.js'
import { ThreadId } from './domain/ThreadId.js'
import { UserSentMessageToChat } from './events/deprecated/UserSentMessageToChat.js'
import { MigrationFailure } from './events/migrations/MigrationFailure.js'
import { MigrationStart } from './events/migrations/MigrationStart.js'
import { MigrationSuccess } from './events/migrations/MigrationSuccess.js'
import { OnboardingUserStartedFirstThread } from './events/onboarding/OnboardingUserStartedFirstThread.js'
import { PhotoAutoSharedWithThread } from './pages/thread/PhotoAutoSharedWithThread.js'
import { PhotoClonedForSharing } from './pages/thread/ThreadPage/events/PhotoClonedForSharing.js'
import { ThreadClonedForSharing } from './pages/thread/ThreadPage/events/ThreadClonedForSharing.js'
import { ThreadSharedWithFamilies } from './pages/thread/ThreadPage/events/ThreadSharedWithFamilies.js'
import { TipTapContentAsJSON } from './pages/thread/TipTapTypes.js'
import { UserInsertedPhotoInRichTextThread } from './pages/thread/UserInsertedPhotoInRichTextThread.js'
import { UserSetChatTitle } from './pages/thread/UserSetChatTitle.js'
import { UserUpdatedThreadAsRichText } from './pages/thread/UserUpdatedThreadAsRichText.js'

type ThreadEvent =
  | OnboardingUserStartedFirstThread
  | UserSetChatTitle
  | UserSentMessageToChat
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | ThreadClonedForSharing

export const threadCloneMigration = async () => {
  const migrationName = 'threadClone'
  const migration = await getSingleEvent<MigrationStart>('MigrationStart', { name: migrationName })

  if (migration) return

  await addToHistory(MigrationStart({ name: migrationName }))

  try {
    const threadEvents = await getEventList<ThreadEvent>([
      'OnboardingUserStartedFirstThread',
      'UserSentMessageToChat',
      'UserUpdatedThreadAsRichText',
      'UserInsertedPhotoInRichTextThread',
      'ThreadClonedForSharing',
      'UserSetChatTitle',
    ])

    const uniqueThreads = new Map<ThreadId, ThreadEvent[]>()
    for (const threadEvent of threadEvents) {
      const { threadId } = threadEvent.payload

      if (!uniqueThreads.has(threadId)) {
        uniqueThreads.set(threadId, [])
      }

      uniqueThreads.get(threadId)!.push(threadEvent)
    }

    for (const [threadId, thisThreadsEvents] of uniqueThreads) {
      const firstEvent = thisThreadsEvents.at(0)!

      // Ignore clone threads
      if (firstEvent.type === 'ThreadClonedForSharing') {
        continue
      }

      // Has it been cloned ?
      const cloneEvents = await getClones(threadId)
      if (cloneEvents.length) {
        // Get the latest clone
        const latestClone = cloneEvents.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()).at(-1)!

        const latestUpdateOfClone = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', {
          threadId: latestClone.payload.threadId,
        })

        const latestContentAsJSON = latestUpdateOfClone?.payload.contentAsJSON || latestClone.payload.contentAsJSON
        await addToHistory(
          UserUpdatedThreadAsRichText({
            contentAsJSON: await replacePhotoClonesWithOriginals({ contentAsJSON: latestContentAsJSON, threadId }),
            threadId,
            userId: firstEvent.payload.userId,
            familyId: firstEvent.payload.familyId,
          })
        )

        // Share with the clone family
        await addToHistory(
          ThreadSharedWithFamilies({
            threadId,
            familyIds: [firstEvent.payload.familyId, latestClone.payload.familyId],
            userId: latestClone.payload.userId,
          })
        )

        // Share the original photos with new family
        await sharePhotosInContent({
          contentAsJSON: latestContentAsJSON,
          threadId,
          shareFamilyId: latestClone.payload.familyId,
        })
      }
    }

    await addToHistory(MigrationSuccess({ name: migrationName }))
  } catch (error) {
    console.error(`Migration ${migrationName} failed`, error)
    await addToHistory(MigrationFailure({ name: migrationName }))
  }
}

async function sharePhotosInContent({
  contentAsJSON,
  threadId,
  shareFamilyId,
}: {
  contentAsJSON: TipTapContentAsJSON
  threadId: ThreadId
  shareFamilyId: FamilyId
}) {
  for (const node of contentAsJSON.content) {
    if (node.type === 'photoNode') {
      const originalPhotoId = await getOriginalPhotoId(node.attrs.photoId)
      await addToHistory(
        PhotoAutoSharedWithThread({
          photoId: originalPhotoId,
          threadId,
          familyId: shareFamilyId,
        })
      )
    }
  }
}

async function replacePhotoClonesWithOriginals({
  contentAsJSON,
  threadId,
}: {
  contentAsJSON: TipTapContentAsJSON
  threadId: ThreadId
}): Promise<TipTapContentAsJSON> {
  const newContentAsJSON: TipTapContentAsJSON = {
    type: 'doc',
    content: [],
  }

  for (const node of contentAsJSON.content) {
    if (node.type === 'photoNode') {
      const originalPhotoId = await getOriginalPhotoId(node.attrs.photoId)
      node.attrs.photoId = originalPhotoId
      node.attrs.threadId = threadId
    }

    newContentAsJSON.content.push(node)
  }

  return newContentAsJSON
}

async function getClones(threadId: ThreadId): Promise<ThreadClonedForSharing[]> {
  const { rows: clonedEvents } = await postgres.query<ThreadClonedForSharing>(
    `SELECT * FROM history WHERE type='ThreadClonedForSharing' AND payload->'clonedFrom'->>'threadId'=$1`,
    [threadId]
  )

  const clones: ThreadClonedForSharing[] = []

  for (const clonedEvent of clonedEvents) {
    const cloneThreadId = clonedEvent.payload.threadId

    clones.push(clonedEvent)
    clones.push(...(await getClones(cloneThreadId)))
  }

  return clones
}

async function getOriginalPhotoId(photoId: PhotoId): Promise<PhotoId> {
  const isPhotoCloned = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })

  if (isPhotoCloned) {
    return getOriginalPhotoId(isPhotoCloned.payload.clonedFrom.photoId)
  }

  return photoId
}
