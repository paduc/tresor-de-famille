import { postgres } from '../../../dependencies/postgres'
import { normalizeBBOX } from '../../../dependencies/rekognition'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../../dependencies/uploadPhoto'
import { ChatEvent } from '../ChatPage/ChatPage'
import { OpenAIMadeDeductions } from '../sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'
import { makeAugmentChatPhotosWithFacesDetected } from './augmentChatPhotosWithFacesDetected'
import { getPersonById } from './getPersonById'

const augmentChatPhotosWithFacesDetected = makeAugmentChatPhotosWithFacesDetected({
  getPersonById,
  normalizeBBOX,
})

export type ChatPhotoEvent = ChatEvent & { type: 'photo' }
export async function retrievePhotosForChat(chatId: string): Promise<ChatPhotoEvent[]> {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const photoRows = photoRowsRes.map(({ occurredAt, payload: { uploadedBy, photoId } }): ChatEvent & { type: 'photo' } => ({
    type: 'photo',
    timestamp: occurredAt,
    profilePicUrl: getProfilePicUrlForUser(uploadedBy),
    photo: {
      id: photoId,
      url: getPhotoUrlFromId(photoId),
      faces: [],
    },
  }))

  await augmentChatPhotosWithFacesDetected(chatId, photoRows)

  await augmentChatPhotosWithPersonsDeducted(chatId, photoRows)
  return photoRows
}

async function augmentChatPhotosWithPersonsDeducted(chatId: string, photoRows: ChatPhotoEvent[]) {
  const { rows: openAIMadeDeductionRows } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1 ORDER BY occurred_at ASC",
    [chatId]
  )

  type FaceId = string
  type PersonId = string
  const faceIdToPersonId = new Map<FaceId, PersonId>()
  for (const deductionRow of openAIMadeDeductionRows) {
    for (const deduction of deductionRow.payload.deductions) {
      if (deduction.type === 'face-is-person') {
        faceIdToPersonId.set(deduction.faceId, deduction.personId)
      }
    }
  }

  for (const photo of photoRows) {
    if (!photo.photo.faces) continue
    for (const face of photo.photo.faces) {
      const personId = faceIdToPersonId.get(face.faceId)
      if (personId) {
        face.person = await getPersonById(personId)
      }
    }
  }
}
