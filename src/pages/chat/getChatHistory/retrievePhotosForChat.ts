import { postgres } from '../../../dependencies/postgres'
import { normalizeBBOX } from '../../../dependencies/rekognition'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../../dependencies/uploadPhoto'
import { ChatEvent } from '../ChatPage/ChatPage'
import { getPersonById } from '../getPersonById.query'
import { FacesRecognizedInChatPhoto } from '../recognizeFacesInChatPhoto/FacesRecognizedInChatPhoto'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'

export async function retrievePhotosForChat(chatId: string) {
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
  return photoRows
}

async function augmentChatPhotosWithFacesDetected(
  chatId: string,
  photoRows: Awaited<ReturnType<typeof retrievePhotosForChat>>
) {
  const { rows: faceDetectedRowsRes } = await postgres.query<FacesRecognizedInChatPhoto>(
    "SELECT * FROM events WHERE type='FacesRecognizedInChatPhoto' AND payload->>'chatId'=$1",
    [chatId]
  )

  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
  for (const facesDetectedRow of facesDetectedRows) {
    const photoRow = photoRows.find((row) => row.photo.id === facesDetectedRow.photoId)

    if (!photoRow) continue

    for (const awsFace of facesDetectedRow.faces) {
      let personName = null
      if (awsFace.personId) {
        const person = await getPersonById(awsFace.personId)
        if (person) {
          personName = person.name
        }
      }

      photoRow.photo.faces = [
        ...(photoRow.photo.faces || []),
        {
          person: personName ? { name: personName } : null,
          faceId: awsFace.AWSFaceId,
          position: normalizeBBOX(awsFace.position),
        },
      ]
    }
  }
}
