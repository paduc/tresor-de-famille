import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { Epoch } from '../../libs/typeguards'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from '../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { ThreadPageProps } from './ThreadPage/ThreadPage'
import { TipTapContentAsJSON, encodeStringy } from './TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from './UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from './UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from './UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from './sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from './uploadPhotoToChat/UserUploadedPhotoToChat'

export const getThreadPageProps = async ({
  threadId,
  userId,
  familyId,
}: {
  threadId: ThreadId
  userId: AppUserId
  familyId: FamilyId
}): Promise<ThreadPageProps> => {
  const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId: threadId })

  const title = titleSet?.payload.title

  const latestEvent = await getSingleEvent<
    UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread
  >(['UserSentMessageToChat', 'UserUpdatedThreadAsRichText', 'UserUploadedPhotoToChat', 'UserInsertedPhotoInRichTextThread'], {
    chatId: threadId,
  })

  if (
    latestEvent &&
    (latestEvent.type === 'UserUpdatedThreadAsRichText' || latestEvent.type === 'UserInsertedPhotoInRichTextThread')
  ) {
    const {
      contentAsJSON: { content },
    } = latestEvent.payload

    const contentAsJSON: TipTapContentAsJSON = { type: 'doc', content: [] }

    for (const contentNode of content) {
      if (contentNode.type !== 'photoNode') {
        contentAsJSON.content.push(contentNode)
        continue
      }
      const { photoId, threadId } = contentNode.attrs

      if (!photoId || !threadId) continue

      const photoInfo = await retrievePhotoInfo({ photoId, userId, familyId })

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

    return {
      threadId,
      contentAsJSON,
      lastUpdated: latestEvent.occurredAt.getTime() as Epoch,
      title: title || '',
    }
  }

  const threadEvents = await getEventList<
    UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread
  >(['UserSentMessageToChat', 'UserUploadedPhotoToChat', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    chatId: threadId,
  })

  const indexOfLatestRichTextEvent = findLastIndex(
    threadEvents,
    (threadEvent) =>
      threadEvent.type === 'UserUpdatedThreadAsRichText' || threadEvent.type === 'UserInsertedPhotoInRichTextThread'
  )

  const latestRichTextEvent = threadEvents.at(indexOfLatestRichTextEvent) as
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread

  const contentAsJSON = latestRichTextEvent?.payload.contentAsJSON || { type: 'doc', content: [] }

  for (const threadEvent of threadEvents.slice(indexOfLatestRichTextEvent + 1)) {
    if (threadEvent.type === 'UserUpdatedThreadAsRichText') continue // should never occur but this helps with types

    if (threadEvent.type === 'UserSentMessageToChat') {
      contentAsJSON.content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: threadEvent.payload.message }],
      })
      continue
    }

    if (threadEvent.type === 'UserUploadedPhotoToChat') {
      const photoId = threadEvent.payload.photoId
      const photoInfo = await retrievePhotoInfo({ photoId, userId, familyId })
      if (!photoInfo) continue

      const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

      contentAsJSON.content.push({
        type: 'photoNode',
        attrs: {
          photoId,
          threadId,
          description,
          personsInPhoto: encodeURIComponent(JSON.stringify(personsInPhoto)),
          unrecognizedFacesInPhoto,
          url: getPhotoUrlFromId(photoId),
        },
      })

      continue
    }
  }

  return {
    threadId,
    contentAsJSON,
    lastUpdated: latestEvent?.occurredAt.getTime() as Epoch,
    title: title || '',
  }
}

export async function retrievePhotoInfo({
  photoId,
  userId,
  familyId,
}: {
  photoId: PhotoId
  userId: AppUserId
  familyId: FamilyId
}): Promise<{
  description: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
} | null> {
  const photoRow = await getSingleEvent<UserUploadedPhotoToChat | UserInsertedPhotoInRichTextThread>(
    ['UserUploadedPhotoToChat', 'UserInsertedPhotoInRichTextThread'],
    {
      photoId,
    }
  )

  if (!photoRow) return null

  const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

  const detectedFaces = facesDetected?.payload.faces || []

  const faces: PhotoFace[] = detectedFaces
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId, userId, familyId })))
    : []

  const personsInPhoto = faces
    .filter((face): face is PhotoFace & { stage: 'done' } => face.stage === 'done')
    .map((face) => face.name)

  const unconfirmedFaceIds = new Set(
    faces
      .filter((face): face is PhotoFace & { stage: 'awaiting-name' } => face.stage === 'awaiting-name')
      .map((face) => face.faceId)
  )

  const caption = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId })

  return {
    description: caption?.payload.caption.body || '',
    personsInPhoto,
    unrecognizedFacesInPhoto: unconfirmedFaceIds.size,
  }
}

type PhotoFace = {
  faceId: FaceId
} & (
  | {
      stage: 'awaiting-name'
    }
  | {
      stage: 'ignored'
    }
  | {
      stage: 'done'
      personId: PersonId
      name: string
    }
)

// Copy from getNewPhotoPageProps()
async function getFamilyDetectedFace(args: {
  faceId: FaceId
  photoId: PhotoId
  userId: AppUserId
  familyId: FamilyId
}): Promise<PhotoFace> {
  const { faceId, photoId, userId, familyId } = args

  const personNamedOrRecognizedEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
      userId,
    }
  )

  const faceIgnoredEvent = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
    ignoredBy: userId,
  })

  type Defined = Exclude<typeof personNamedOrRecognizedEvent | typeof faceIgnoredEvent, undefined>

  const latestEvent = [personNamedOrRecognizedEvent, faceIgnoredEvent]
    .filter((event): event is Defined => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .at(-1)

  if (latestEvent) {
    if (latestEvent.type === 'FaceIgnoredInPhoto') {
      return {
        faceId,
        stage: 'ignored',
      }
    }

    const { type, payload } = latestEvent
    const { personId } = payload

    let name: string
    if (type === 'UserNamedPersonInPhoto') {
      name = payload.name
    } else {
      name = (await getPersonByIdOrThrow(personId)).name
    }

    return {
      faceId,
      stage: 'done',
      personId,
      name,
    }
  }

  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId({ faceId, userId, familyId })
  if (persons.length) {
    const personId = persons[0]
    const person = await getPersonById(personId)

    if (person) {
      return {
        faceId,
        stage: 'done',
        personId,
        name: person.name,
      }
    }
  }

  return {
    faceId,
    stage: 'awaiting-name',
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
