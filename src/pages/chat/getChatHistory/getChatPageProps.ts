import { getEventList } from '../../../dependencies/getEventList'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID, isUUID } from '../../../domain'
import { FaceIgnoredInPhoto } from '../../../events/onboarding/FaceIgnoredInPhoto'
import { OnboardingUserStartedFirstThread } from '../../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserNamedPersonInPhoto } from '../../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../../events/onboarding/UserRecognizedPersonInPhoto'
import { getPersonById, getPersonByIdOrThrow } from '../../_getPersonById'
import { getPersonIdsForFaceId } from '../../_getPersonsIdsForFaceId'
import { UserAddedCaptionToPhoto } from '../../photo/UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from '../../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { ChatEvent, ChatPageProps } from '../ChatPage/ChatPage'
import { UserSetChatTitle } from '../UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

export const getChatPageProps = async (chatId: UUID): Promise<ChatPageProps> => {
  const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId })

  const title = titleSet?.payload.title

  const latestEvent = await getSingleEvent<UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText>(
    ['UserSentMessageToChat', 'UserUpdatedThreadAsRichText', 'UserUploadedPhotoToChat'],
    { chatId }
  )

  if (latestEvent && latestEvent.type === 'UserUpdatedThreadAsRichText') {
    const { contentAsJSON } = latestEvent.payload

    const photoNodes = contentAsJSON.content.filter((node) => node.type === 'photoNode')

    for (const photoNode of photoNodes) {
      const { photoId, chatId } = photoNode.attrs!

      if (!photoId || !chatId) continue

      if (!isUUID(photoId)) continue

      const photoInfo = await retrievePhotoInfo(photoId)

      if (!photoInfo) continue

      const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

      photoNode.attrs = {
        photoId,
        chatId,
        description,
        personsInPhoto: encodeURIComponent(JSON.stringify(personsInPhoto)),
        unrecognizedFacesInPhoto,
        url: getPhotoUrlFromId(photoId as UUID),
      }
    }

    return {
      chatId,
      contentAsJSON,
      title: title || '',
    }
  }

  const chatEvents = await getEventList<UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText>(
    ['UserSentMessageToChat', 'UserUploadedPhotoToChat', 'UserUpdatedThreadAsRichText'],
    { chatId }
  )

  const indexOfLatestRichTextEvent = chatEvents.map((event) => event.type).lastIndexOf('UserUpdatedThreadAsRichText')
  const latestRichTextEvent = chatEvents.at(indexOfLatestRichTextEvent) as UserUpdatedThreadAsRichText

  const contentAsJSON = latestRichTextEvent?.payload.contentAsJSON || { type: 'doc', content: [] }

  for (const chatEvent of chatEvents.slice(indexOfLatestRichTextEvent + 1)) {
    if (chatEvent.type === 'UserUpdatedThreadAsRichText') continue // should never occur but this helps with types

    if (chatEvent.type === 'UserSentMessageToChat') {
      contentAsJSON.content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: chatEvent.payload.message }],
      })
      continue
    }

    if (chatEvent.type === 'UserUploadedPhotoToChat') {
      const photoId = chatEvent.payload.photoId
      const photoInfo = await retrievePhotoInfo(photoId)
      if (!photoInfo) continue

      const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

      contentAsJSON.content.push({
        type: 'photoNode',
        attrs: {
          photoId,
          chatId,
          description,
          personsInPhoto: encodeURIComponent(JSON.stringify(personsInPhoto)),
          unrecognizedFacesInPhoto,
          url: getPhotoUrlFromId(photoId as UUID),
        },
      })

      continue
    }
  }

  return {
    chatId,
    contentAsJSON,
    title: title || '',
  }
}

export async function retrievePhotoInfo(photoId: UUID): Promise<{
  description: string
  personsInPhoto: string[]
  unrecognizedFacesInPhoto: number
} | null> {
  const photoRow = await getSingleEvent<UserUploadedPhotoToChat>('UserUploadedPhotoToChat', {
    photoId,
  })

  if (!photoRow) return null

  const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

  const detectedFaces = facesDetected?.payload.faces || []

  const faces: PhotoFace[] = detectedFaces
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId })))
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

type ChatPhotoEvent = ChatEvent & { type: 'photo' }
export async function retrievePhotosForChat(chatId: UUID): Promise<ChatPhotoEvent[]> {
  const photoRows = await getEventList<UserUploadedPhotoToChat>('UserUploadedPhotoToChat', { chatId })

  const photoEvents: ChatPhotoEvent[] = []

  for (const { occurredAt, payload } of photoRows) {
    const { photoId } = payload

    const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

    const detectedFaces = facesDetected?.payload.faces || []

    const faces: PhotoFace[] = detectedFaces
      ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId })))
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

    photoEvents.push({
      type: 'photo',
      timestamp: occurredAt.getTime(),
      photoId,
      url: getPhotoUrlFromId(photoId),
      description: caption?.payload.caption.body,
      personsInPhoto,
      unrecognizedFacesInPhoto: unconfirmedFaceIds.size,
      chatId,
    })
  }

  return photoEvents
}

type PhotoFace = {
  faceId: UUID
} & (
  | {
      stage: 'awaiting-name'
    }
  | {
      stage: 'ignored'
    }
  | {
      stage: 'done'
      personId: UUID
      name: string
    }
)

async function getFamilyDetectedFace(args: { faceId: UUID; photoId: UUID }): Promise<PhotoFace> {
  const { faceId, photoId } = args

  // Has a this face been named or recognized ?
  const personNamedOrRecognized = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
    }
  )

  if (personNamedOrRecognized) {
    // Yes, the face was named or recognized
    const { type, payload } = personNamedOrRecognized
    const { personId } = payload

    let name: string
    if (type === 'UserNamedPersonInPhoto') {
      name = payload.name
    } else {
      name = (await getPersonByIdOrThrow(personId)).name
    }
  }

  // Has this face been ignored ?
  const faceIgnored = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
  })

  if (faceIgnored) {
    return {
      faceId,
      stage: 'ignored',
    }
  }

  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId(faceId)
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

type ChatMessageItem = ChatEvent & {
  type: 'message'
}

async function retrieveMessagesForChat(chatId: UUID): Promise<ChatMessageItem[]> {
  const chatMessages = await getEventList<UserSentMessageToChat>('UserSentMessageToChat', { chatId })

  const onboardingThread = await getEventList<OnboardingUserStartedFirstThread>('OnboardingUserStartedFirstThread', {
    threadId: chatId,
  })

  const messageRows = [...chatMessages, ...onboardingThread]

  const messages = messageRows.map(({ occurredAt, payload: { message } }): ChatEvent & { type: 'message' } => ({
    type: 'message',
    timestamp: occurredAt.getTime(),
    message: {
      body: message,
    },
  }))
  return messages
}
