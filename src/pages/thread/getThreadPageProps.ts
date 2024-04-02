import { getEventList } from '../../dependencies/getEventList.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { MediaId } from '../../domain/MediaId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { getFacesInPhoto } from '../_getFacesInPhoto.js'
import { getPersonByIdOrThrow } from '../_getPersonById.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getPhotoDatetime } from '../_getPhotoDatetime.js'
import { getPhotoLocation } from '../_getPhotoLocation.js'
import { getThreadAuthor } from '../_getThreadAuthor.js'
import { ThreadEvent, getThreadEvents } from '../_getThreadEvents.js'
import { getThreadFamilies } from '../_getThreadFamilies.js'
import { getUserFamilies } from '../_getUserFamilies.js'
import { getThreadComments } from '../commentApi/getThreadComments.js'
import { BunnyMediaStatusUpdated } from '../media/BunnyMediaStatusUpdated.js'
import { BunnyMediaUploaded } from '../media/BunnyMediaUploaded.js'
import { ReadyOrErrorStatus } from '../media/MediaStatus.js'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto.js'
import { ThreadPageProps } from './ThreadPage/ThreadPage.js'
import { TipTapContentAsJSON, encodeStringy } from './TipTapTypes.js'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread.js'
import { UserSetCaptionOfMediaInThread } from './UserSetCaptionOfMediaInThread.js'
import { UserSetCaptionOfPhotoInThread } from './UserSetCaptionOfPhotoInThread.js'
import { UserSetChatTitle } from './UserSetChatTitle.js'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText.js'

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
      // @ts-ignore
      if (contentNode.type === 'insertPhotoMarker') {
        // some old threads have insertPhotoMarker nodes...
        // ignore them
        continue
      }

      if (contentNode.type === 'photoNode') {
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

      if (contentNode.type === 'mediaNode') {
        const { mediaId } = contentNode.attrs

        const uploadedEvent = await getSingleEvent<BunnyMediaUploaded>('BunnyMediaUploaded', { mediaId })

        if (!uploadedEvent) continue

        const { bunnyVideoId, bunnyLibraryId } = uploadedEvent.payload
        const statusEvents = await getEventList<BunnyMediaStatusUpdated>('BunnyMediaStatusUpdated', {
          LibraryId: bunnyLibraryId,
          VideoId: bunnyVideoId,
        })

        const latestStatusEvent = statusEvents.filter((event) => ReadyOrErrorStatus.includes(event.payload.Status)).at(-1)

        const newAttrs = {
          ...contentNode.attrs,
          caption: await getMediaCaption({ mediaId, threadId }),
          status: latestStatusEvent?.payload.Status || contentNode.attrs.status,
        }

        contentAsJSON.content.push({
          type: 'mediaNode',
          attrs: newAttrs,
        })
      }

      if (contentNode.type === 'paragraph') {
        contentAsJSON.content.push(contentNode)
      }
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

async function getMediaCaption({ mediaId, threadId }: { mediaId: MediaId; threadId: ThreadId }) {
  const captionForThread = await getSingleEvent<UserSetCaptionOfMediaInThread>('UserSetCaptionOfMediaInThread', {
    mediaId,
    threadId,
  })

  if (captionForThread) {
    return captionForThread.payload.caption
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
