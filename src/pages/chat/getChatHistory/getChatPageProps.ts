import { getEventList } from '../../../dependencies/getEventList'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
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
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

export const getChatPageProps = async (chatId: UUID): Promise<ChatPageProps> => {
  const photoRows = await retrievePhotosForChat(chatId)

  const messageRows = await retrieveMessagesForChat(chatId)

  const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId })

  const title = titleSet?.payload.title

  return {
    chatId,
    history: [...photoRows, ...messageRows].sort((a, b) => a.timestamp - b.timestamp),
    title: title || '',
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
