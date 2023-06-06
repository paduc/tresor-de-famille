import { postgres } from '../../../dependencies/database'
import { getPhotoUrlFromId } from '../../../dependencies/photo-storage'
import { UUID } from '../../../domain'
import { ChatEvent } from '../ChatPage/ChatPage'
import { AWSFacesDetectedInChatPhoto } from '../recognizeFacesInChatPhoto/AWSFacesDetectedInChatPhoto'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

export type ChatPhotoEvent = ChatEvent & { type: 'photo' }
export async function retrievePhotosForChat(chatId: UUID): Promise<ChatPhotoEvent[]> {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const facesForPhotoId = await getFaceDetectionMap(chatId)

  const photoRows = photoRowsRes.map(({ occurredAt, payload: { uploadedBy, photoId } }): ChatEvent & { type: 'photo' } => ({
    type: 'photo',
    timestamp: occurredAt.getTime(),
    photoId,
    url: getPhotoUrlFromId(photoId),
    description: undefined,
    personsInPhoto: [],
    unrecognizedFacesInPhoto: facesForPhotoId.get(photoId)?.unrecognizedFacesInPhoto || 0,
  }))
  return photoRows
}

type PhotoId = UUID

async function getFaceDetectionMap(chatId: UUID): Promise<Map<PhotoId, { unrecognizedFacesInPhoto: number }>> {
  // TODO: get persons thanks to FaceIdLinkedToPerson events (not emitted yet)

  const facesForPhotoId = new Map<PhotoId, { unrecognizedFacesInPhoto: number }>()

  const { rows: faceDetectedRowsRes } = await postgres.query<AWSFacesDetectedInChatPhoto>(
    "SELECT * FROM history WHERE type='AWSFacesDetectedInChatPhoto' AND payload->>'chatId'=$1",
    [chatId]
  )

  for (const faceDetectedRow of faceDetectedRowsRes) {
    const photoId = faceDetectedRow.payload.photoId
    if (!facesForPhotoId.has(photoId)) {
      facesForPhotoId.set(photoId, { unrecognizedFacesInPhoto: 0 })
    }
    for (const awsFace of faceDetectedRow.payload.faces) {
      facesForPhotoId.get(photoId)!.unrecognizedFacesInPhoto++
    }
  }

  return facesForPhotoId
}
