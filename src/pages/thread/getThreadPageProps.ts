import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId, isThreadId } from '../../domain/ThreadId'
import { getEpoch } from '../../libs/typeguards'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPhotoCaption } from '../_getPhotoCaption'
import { getThreadAuthor } from '../_getThreadAuthor'
import { ThreadEvent, getThreadEvents } from '../_getThreadEvents'
import { getThreadFamilies } from '../_getThreadFamilies'
import { ThreadPageProps } from './ThreadPage/ThreadPage'
import { TipTapContentAsJSON, encodeStringy } from './TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'

export const getThreadPageProps = async ({
  threadId,
  userId,
}: {
  threadId: ThreadId
  userId: AppUserId
}): Promise<ThreadPageProps> => {
  const DEFAULT_CONTENT: TipTapContentAsJSON = { type: 'doc', content: [] } as const

  const threadEvents = await getThreadEvents(threadId)
  if (!threadEvents.length) {
    // New thread
    return {
      threadId,
      contentAsJSON: DEFAULT_CONTENT,
      lastUpdated: undefined,
      title: '',
      familyId: userId as string as FamilyId,
      sharedWithFamilyIds: [],
      isAuthor: true,
      isNewThread: true,
    }
  }

  const threadAuthorId = await getThreadAuthor(threadId)
  const isAuthor = threadAuthorId === userId

  const sharedWithFamilyIds = await getThreadFamilies(threadId)

  if (threadEvents.every((event): event is UserSetChatTitle => event.type === 'UserSetChatTitle')) {
    // All events are title events

    const latestSetTitleEvent = threadEvents.at(-1)!
    const { title, familyId, userId: authorId } = latestSetTitleEvent.payload
    return {
      threadId,
      contentAsJSON: DEFAULT_CONTENT,
      lastUpdated: getEpoch(latestSetTitleEvent.occurredAt),
      title,
      familyId,
      sharedWithFamilyIds,
      isAuthor,
      isNewThread: false,
    }
  }

  const lastUpdateEvent = threadEvents
    .filter((event): event is Exclude<ThreadEvent, UserSetChatTitle> => event.type !== 'UserSetChatTitle')
    .at(-1)

  const latestTitleEvent = threadEvents.filter((event): event is UserSetChatTitle => event.type === 'UserSetChatTitle').at(-1)

  const firstEventPayload = threadEvents.at(0)!.payload

  const familyId = firstEventPayload.familyId

  const contentAsJSON: TipTapContentAsJSON = Object.assign({}, DEFAULT_CONTENT)

  if (lastUpdateEvent) {
    const {
      contentAsJSON: { content },
    } = lastUpdateEvent.payload

    for (const contentNode of content) {
      if (contentNode.type !== 'photoNode') {
        contentAsJSON.content.push(contentNode)
        continue
      }
      const { photoId, threadId } = contentNode.attrs

      if (!photoId || !threadId || !isThreadId(threadId)) continue

      const photoInfo = await retrievePhotoInfo({ photoId, familyId })

      if (!photoInfo) continue

      const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

      const newAttrs = {
        photoId,
        threadId,
        description,
        personsInPhoto: encodeStringy(personsInPhoto),
        unrecognizedFacesInPhoto,
        url: getPhotoUrlFromId(photoId),
      }

      contentAsJSON.content.push({
        type: 'photoNode',
        attrs: newAttrs,
      })
    }
  }

  return {
    threadId,
    contentAsJSON,
    lastUpdated: getEpoch(threadEvents.at(-1)!.occurredAt),
    title: latestTitleEvent?.payload.title || '',
    familyId,
    sharedWithFamilyIds,
    isAuthor,
    isNewThread: false,
  }
}

async function retrievePhotoInfo({ photoId, familyId }: { photoId: PhotoId; familyId: FamilyId }): Promise<{
  description: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
} | null> {
  const facesInPhoto = await getFacesInPhoto({ photoId })

  const personsInPhoto = (
    await Promise.all(
      facesInPhoto
        .map((face) => face.personId)
        .filter((personIdOrNot): personIdOrNot is PersonId => !!personIdOrNot)
        .map((personId) => getPersonByIdOrThrow({ personId }))
    )
  ).map((person) => person.name)

  const unconfirmedFaceIds = new Set(
    facesInPhoto.filter((face) => !face.personId && !face.isIgnored).map((face) => face.faceId)
  )

  return {
    description: await getPhotoCaption({ photoId }),
    personsInPhoto,
    unrecognizedFacesInPhoto: unconfirmedFaceIds.size,
  }
}

function findLastIndex<T>(array: T[], callback: (item: T) => boolean): number {
  const reversedArray = array.slice().reverse()
  const index = reversedArray.findIndex(callback)
  if (index === -1) {
    return -1 // Object not found in the array
  }
  return array.length - 1 - index // Adjust the index to the original array
}

export async function getThreadContents(
  threadId: ThreadId
): Promise<{ contentAsJSON: TipTapContentAsJSON; title: string | undefined; authorId: AppUserId; familyId: FamilyId } | null> {
  const DEFAULT_CONTENT: TipTapContentAsJSON = { type: 'doc', content: [] }

  let latestEvent: UserUpdatedThreadAsRichText | UserSetChatTitle | UserInsertedPhotoInRichTextThread | undefined =
    await getSingleEvent<UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread>(
      ['UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'],
      {
        threadId,
      }
    )

  const setTitleEvent = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { threadId })

  if (!latestEvent && !setTitleEvent) {
    return null
  }

  const title = setTitleEvent?.payload.title

  return {
    contentAsJSON: latestEvent?.payload.contentAsJSON || DEFAULT_CONTENT,
    title,
    authorId: (latestEvent || setTitleEvent)!.payload.userId,
    familyId: (latestEvent || setTitleEvent)!.payload.familyId,
  }
}
