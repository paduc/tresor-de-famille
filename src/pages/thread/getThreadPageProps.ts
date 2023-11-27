import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { getEpoch } from '../../libs/typeguards'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPhotoCaption } from '../_getPhotoCaption'
import { ThreadClonedForSharing } from './ThreadPage/ThreadClonedForSharing'
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
  const DEFAULT_CONTENT: TipTapContentAsJSON = { type: 'doc', content: [] }

  const threadEvents = await getThreadEvents(threadId)

  if (!threadEvents.length) {
    // New thread
    return {
      threadId,
      contentAsJSON: DEFAULT_CONTENT,
      lastUpdated: undefined,
      title: '',
      familyId: userId as string as FamilyId,
      isAuthor: true,
    }
  }

  if (threadEvents.every((event): event is UserSetChatTitle => event.type === 'UserSetChatTitle')) {
    // All events are title events

    const latestSetTitleEvent = threadEvents.at(-1)!
    const { title, familyId, userId } = latestSetTitleEvent.payload
    return {
      threadId,
      contentAsJSON: DEFAULT_CONTENT,
      lastUpdated: getEpoch(latestSetTitleEvent.occurredAt),
      title,
      familyId,
      isAuthor: userId === userId,
    }
  }

  const lastUpdateEvent = threadEvents
    .filter((event): event is Exclude<ThreadEvent, UserSetChatTitle> => event.type !== 'UserSetChatTitle')
    .at(-1)

  const latestTitleEvent = threadEvents
    .filter(
      (event): event is UserSetChatTitle | ThreadClonedForSharing =>
        event.type === 'UserSetChatTitle' || event.type === 'ThreadClonedForSharing'
    )
    .at(-1)

  const firstEventPayload = threadEvents.at(0)!.payload

  const familyId = firstEventPayload.familyId
  const contentAsJSON: TipTapContentAsJSON = DEFAULT_CONTENT
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

      if (!photoId || !threadId) continue

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
    isAuthor: firstEventPayload.userId === userId,
  }

  // const setTitleEvent = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: threadId })

  // const threadClonedEvent = await getSingleEvent<ThreadClonedForSharing>('ThreadClonedForSharing', { threadId })

  // const title = (setTitleEvent || threadClonedEvent)?.payload.title

  // if (!latestEvent) {
  //   if (title) {
  //     // Thread with only a title
  //     return {
  //       threadId,
  //       contentAsJSON: DEFAULT_CONTENT,
  //       lastUpdated: getEpoch(setTitleEvent.occurredAt),
  //       title,
  //       familyId: setTitleEvent.payload.familyId,
  //       isAuthor: setTitleEvent.payload.userId === userId,
  //     }
  //   }
  // }

  // const familyId = latestEvent.payload.familyId

  // if (
  //   latestEvent.type === 'ThreadClonedForSharing' ||
  //   latestEvent.type === 'UserUpdatedThreadAsRichText' ||
  //   latestEvent.type === 'UserInsertedPhotoInRichTextThread'
  // ) {
  //   const {
  //     contentAsJSON: { content },
  //   } = latestEvent.payload

  //   const contentAsJSON: TipTapContentAsJSON = DEFAULT_CONTENT

  //   for (const contentNode of content) {
  //     if (contentNode.type !== 'photoNode') {
  //       contentAsJSON.content.push(contentNode)
  //       continue
  //     }
  //     const { photoId, threadId } = contentNode.attrs

  //     if (!photoId || !threadId) continue

  //     const photoInfo = await retrievePhotoInfo({ photoId, familyId })

  //     if (!photoInfo) continue

  //     const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

  //     const newAttrs = {
  //       photoId,
  //       threadId,
  //       description,
  //       personsInPhoto: encodeStringy(personsInPhoto),
  //       unrecognizedFacesInPhoto,
  //       url: getPhotoUrlFromId(photoId),
  //     }

  //     contentAsJSON.content.push({
  //       type: 'photoNode',
  //       attrs: newAttrs,
  //     })
  //   }

  //   return {
  //     threadId,
  //     contentAsJSON,
  //     lastUpdated: latestEvent.occurredAt.getTime() as Epoch,
  //     title: title || threadClonedEvent?.payload.title || '',
  //     familyId,
  //     isAuthor: latestEvent.payload.userId === userId,
  //   }
  // }
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

  let latestEvent:
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
    | ThreadClonedForSharing // to make latestEvent compatible with cloneEvent below
    | undefined = await getSingleEvent<UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread>(
    ['UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'],
    {
      chatId: threadId,
    }
  )

  const cloneEvent = await getSingleEvent<ThreadClonedForSharing>('ThreadClonedForSharing', { threadId })

  if (cloneEvent) {
    if (!latestEvent || latestEvent.occurredAt.getTime() > cloneEvent.occurredAt.getTime()) {
      // The latest on this thread is the cloneEvent
      latestEvent = cloneEvent
    }
  }

  const setTitleEvent = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: threadId })

  if (!latestEvent && !setTitleEvent) {
    return null
  }

  const title = (setTitleEvent || cloneEvent)?.payload.title

  return {
    contentAsJSON: latestEvent?.payload.contentAsJSON || DEFAULT_CONTENT,
    title,
    authorId: (latestEvent || setTitleEvent)!.payload.userId,
    familyId: (latestEvent || setTitleEvent)!.payload.familyId,
  }
}

type ThreadEvent =
  | UserSetChatTitle
  // | UserSentMessageToChat
  // | UserUploadedPhotoToChat
  | UserUpdatedThreadAsRichText
  | UserInsertedPhotoInRichTextThread
  | ThreadClonedForSharing

async function getThreadEvents(threadId: ThreadId): Promise<ThreadEvent[]> {
  const threadClonedEvent = await getSingleEvent<ThreadClonedForSharing>('ThreadClonedForSharing', { threadId })

  const updateEvents = await getEventList<
    | UserSetChatTitle
    // | UserSentMessageToChat
    // | UserUploadedPhotoToChat
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread
  >(['UserSetChatTitle', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    chatId: threadId,
  })

  return [threadClonedEvent, ...updateEvents]
    .filter((event): event is ThreadEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
