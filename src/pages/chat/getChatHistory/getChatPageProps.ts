import { getEventList } from '../../../dependencies/getEventList'
import { getSingleEvent } from '../../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID, isUUID } from '../../../domain'
import { FaceIgnoredInPhoto } from '../../../events/onboarding/FaceIgnoredInPhoto'
import { OnboardingUserStartedFirstThread } from '../../../events/onboarding/OnboardingUserStartedFirstThread'
import { UserNamedPersonInPhoto } from '../../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../../events/onboarding/UserRecognizedPersonInPhoto'
import { Epoch } from '../../../libs/typeguards'
import { getPersonById, getPersonByIdOrThrow } from '../../_getPersonById'
import { getPersonIdsForFaceId } from '../../_getPersonsIdsForFaceId'
import { UserAddedCaptionToPhoto } from '../../photo/UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from '../../photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { ChatEvent, ChatPageProps } from '../ChatPage/ChatPage'
import { PhotoNode, TipTapContentAsJSON, encodeStringy } from '../TipTapTypes'
import { UserInsertedPhotoInRichTextThread } from '../UserInsertedPhotoInRichTextThread'
import { UserSetChatTitle } from '../UserSetChatTitle'
import { UserUpdatedThreadAsRichText } from '../UserUpdatedThreadAsRichText'
import { UserSentMessageToChat } from '../sendMessageToChat/UserSentMessageToChat'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

export const getChatPageProps = async ({ chatId, userId }: { chatId: UUID; userId: UUID }): Promise<ChatPageProps> => {
  const titleSet = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { chatId })

  const title = titleSet?.payload.title

  const latestEvent = await getSingleEvent<
    UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread
  >(['UserSentMessageToChat', 'UserUpdatedThreadAsRichText', 'UserUploadedPhotoToChat', 'UserInsertedPhotoInRichTextThread'], {
    chatId,
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
      const { photoId, chatId } = contentNode.attrs

      if (!photoId || !chatId) continue

      const photoInfo = await retrievePhotoInfo({ photoId, userId })

      if (!photoInfo) continue

      const { description, personsInPhoto, unrecognizedFacesInPhoto } = photoInfo

      const newAttrs = {
        photoId,
        chatId,
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
      chatId,
      contentAsJSON,
      lastUpdated: latestEvent.occurredAt.getTime() as Epoch,
      title: title || '',
    }
  }

  const chatEvents = await getEventList<
    UserSentMessageToChat | UserUploadedPhotoToChat | UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread
  >(['UserSentMessageToChat', 'UserUploadedPhotoToChat', 'UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'], {
    chatId,
  })

  const indexOfLatestRichTextEvent = findLastIndex(
    chatEvents,
    (chatEvent) => chatEvent.type === 'UserUpdatedThreadAsRichText' || chatEvent.type === 'UserInsertedPhotoInRichTextThread'
  )

  const latestRichTextEvent = chatEvents.at(indexOfLatestRichTextEvent) as
    | UserUpdatedThreadAsRichText
    | UserInsertedPhotoInRichTextThread

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
      const photoInfo = await retrievePhotoInfo({ photoId, userId })
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
    lastUpdated: latestEvent?.occurredAt.getTime() as Epoch,
    title: title || '',
  }
}

export async function retrievePhotoInfo({ photoId, userId }: { photoId: UUID; userId: UUID }): Promise<{
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
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId, userId })))
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

// Copy from getNewPhotoPageProps()
async function getFamilyDetectedFace(args: { faceId: UUID; photoId: UUID; userId: UUID }): Promise<PhotoFace> {
  const { faceId, photoId, userId } = args

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
  const persons = await getPersonIdsForFaceId({ faceId, userId })
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

function findLastIndex<T>(array: T[], callback: (item: T) => boolean): number {
  const reversedArray = array.slice().reverse()
  const index = reversedArray.findIndex(callback)
  if (index === -1) {
    return -1 // Object not found in the array
  }
  return array.length - 1 - index // Adjust the index to the original array
}
