import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonForUser } from '../_getPersonForUser'
import { getPhotoDatetime } from '../_getPhotoDatetime'
import { getPhotoLocation } from '../_getPhotoLocation'
import { getThreadAuthor } from '../_getThreadAuthor'
import { ThreadEvent, getThreadEvents } from '../_getThreadEvents'
import { getThreadFamilies } from '../_getThreadFamilies'
import { getUserFamilies } from '../_getUserFamilies'
import { getThreadComments } from '../commentApi/getThreadComments'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { ThreadPageProps } from './ThreadPage/ThreadPage'
import { TipTapContentAsJSON, encodeStringy } from './TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetCaptionOfPhotoInThread } from './UserSetCaptionOfPhotoInThread'
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
      authorName: (await getPersonForUser({ userId }))?.name,
      familyId: userId as string as FamilyId,
      sharedWithFamilyIds: [],
      isAuthor: true,
      isNewThread: true,
      comments: [],
    }
  }

  const comments = await getThreadComments({ threadId })

  const threadAuthorId = await getThreadAuthor(threadId)
  const isAuthor = threadAuthorId === userId

  const sharedWithFamilyIds = await getThreadFamilies(threadId)

  if (!isAuthor) {
    const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)
    if (!userFamilyIds.some((userFamilyId) => sharedWithFamilyIds?.includes(userFamilyId))) {
      throw new Error(`Unauthorized: vous n'avez pas le droit de voir ce fil.`)
    }
  }

  if (threadEvents.every((event): event is UserSetChatTitle => event.type === 'UserSetChatTitle')) {
    // All events are title events

    const latestSetTitleEvent = threadEvents.at(-1)!
    const { title, familyId, userId: authorId } = latestSetTitleEvent.payload
    return {
      threadId,
      contentAsJSON: DEFAULT_CONTENT,
      lastUpdated: latestSetTitleEvent.occurredAt.toISOString(),
      title,
      familyId,
      sharedWithFamilyIds,
      isAuthor,
      authorName: threadAuthorId && (await getPersonForUser({ userId: threadAuthorId }))?.name,
      isNewThread: false,
      comments,
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
    let content: TipTapContentAsJSON['content']

    if (lastUpdateEvent.type === 'UserSentMessageToChat') {
      const textContent = lastUpdateEvent.payload.message
      content = [{ type: 'paragraph', content: [{ type: 'text', text: textContent }] }]
    } else {
      content = lastUpdateEvent.payload.contentAsJSON.content
    }

    for (const contentNode of content) {
      if (contentNode.type !== 'photoNode') {
        // @ts-ignore
        if (contentNode.type === 'insertPhotoMarker') {
          // some old threads have insertPhotoMarker nodes...
          continue
        }
        contentAsJSON.content.push(contentNode)
        continue
      }

      const { photoId } = contentNode.attrs

      if (!photoId) continue

      const photoInfo = await getPhotoInfo({ photoId, userId, threadId })

      if (!photoInfo) continue

      const { caption, personsInPhoto, unrecognizedFacesInPhoto, locationName, datetime } = photoInfo

      const newAttrs = {
        photoId,
        threadId,
        caption,
        personsInPhoto: encodeStringy(personsInPhoto),
        unrecognizedFacesInPhoto,
        url: getPhotoUrlFromId(photoId),
        locationName,
        datetime,
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
    lastUpdated: threadEvents.at(-1)!.occurredAt.toISOString(),
    title: latestTitleEvent?.payload.title || '',
    familyId,
    sharedWithFamilyIds,
    isAuthor,
    authorName: threadAuthorId && (await getPersonForUser({ userId: threadAuthorId }))?.name,
    isNewThread: false,
    comments,
  }
}

async function getPhotoInfo({
  photoId,
  userId,
  threadId,
}: {
  photoId: PhotoId
  userId: AppUserId
  threadId: ThreadId
}): Promise<{
  caption: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
  locationName: string | undefined
  datetime: Awaited<ReturnType<typeof getPhotoDatetime>>
} | null> {
  const facesInPhoto = await getFacesInPhoto({ photoId, userId })

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
    caption: await getPhotoCaption({ photoId, threadId }),
    personsInPhoto,
    unrecognizedFacesInPhoto: unconfirmedFaceIds.size,
    locationName: await getPhotoLocationName({ photoId }),
    datetime: await getPhotoDatetime({ photoId }),
  }
}

// async function getPhotoDateAsText({ photoId }: { photoId: PhotoId }) {
//   const photoDate = await getPhotoDatetime({ photoId })

//   console.log({ photoDate })

//   if (!photoDate) return

//   if (photoDate.userOption === 'none') return
//   if (photoDate.userOption === 'user') return { photoDate.userProvided
//   if (photoDate.userOption === 'exif'){
//     return photoDate.exifDatetime
//   }
// }

async function getPhotoLocationName({ photoId }: { photoId: PhotoId }) {
  const photoLocation = await getPhotoLocation({ photoId })

  if (!photoLocation) return
  const { name } = photoLocation

  if (name.userOption === 'user') return name.userProvided
  if (name.userOption === 'mapboxFromExif') return name.mapbox.exif
}

async function getPhotoCaption({ photoId, threadId }: { photoId: PhotoId; threadId: ThreadId }) {
  const captionForThread = await getSingleEvent<UserSetCaptionOfPhotoInThread>('UserSetCaptionOfPhotoInThread', {
    photoId,
    threadId,
  })

  if (captionForThread) {
    return captionForThread.payload.caption
  }

  const captionEvent = await getSingleEvent<UserAddedCaptionToPhoto>(['UserAddedCaptionToPhoto'], { photoId })

  if (captionEvent) {
    return captionEvent.payload.caption.body
  }

  return ''
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
