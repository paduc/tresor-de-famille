import { postgres } from '../../dependencies/postgres'
import { normalizeBBOX } from '../../dependencies/rekognition'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../dependencies/uploadPhoto'
import { ChatEvent, ChatPageProps, ChatPhotoFace } from './ChatPage'
import { FacesRecognizedInChatPhoto } from './FacesRecognizedInChatPhoto'
import { getPersonById } from './getPersonById.query'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'

export const getChatHistory = async (chatId: string): Promise<ChatPageProps['history']> => {
  const { rows } = await postgres.query<UserUploadedPhotoToChat | FacesRecognizedInChatPhoto>(
    "SELECT * FROM events WHERE type IN ('UserUploadedPhotoToChat', 'FacesRecognizedInChatPhoto') AND payload->>'chatId'=$1",
    [chatId]
  )

  const photoRows = rows.filter(isPhotoRow).map(({ payload: { uploadedBy, photoId } }): ChatEvent & { type: 'photo' } => ({
    type: 'photo',
    profilePicUrl: getProfilePicUrlForUser(uploadedBy),
    photo: {
      id: photoId,
      url: getPhotoUrlFromId(photoId),
      faces: [],
    },
  }))

  const facesDetectedRows = rows.filter(isFaceDetectedRow).map((row) => row.payload)
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
          personName,
          position: normalizeBBOX(awsFace.position),
        },
      ]
    }
  }

  return photoRows
}

function isPhotoRow(row: any): row is UserUploadedPhotoToChat {
  return row.type === 'UserUploadedPhotoToChat'
}

function isFaceDetectedRow(row: any): row is FacesRecognizedInChatPhoto {
  return row.type === 'FacesRecognizedInChatPhoto'
}
