import { postgres } from '../../dependencies/postgres'
import { normalizeBBOX } from '../../dependencies/rekognition'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../dependencies/uploadPhoto'
import { ChatEvent, ChatPageProps, ChatPhotoFace } from './ChatPage'
import { FacesRecognizedInChatPhoto } from './FacesRecognizedInChatPhoto'
import { getPersonById } from './getPersonById.query'
import { UserSentMessageToChat } from './UserSentMessageToChat'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'

export const getChatHistory = async (chatId: string): Promise<ChatPageProps['history']> => {
  const { rows } = await postgres.query<UserUploadedPhotoToChat | FacesRecognizedInChatPhoto | UserSentMessageToChat>(
    "SELECT * FROM events WHERE type IN ('UserUploadedPhotoToChat', 'FacesRecognizedInChatPhoto', 'UserSentMessageToChat') AND payload->>'chatId'=$1",
    [chatId]
  )

  const photoRows = rows
    .filter(isPhotoRow)
    .map(({ occurredAt, payload: { uploadedBy, photoId } }): ChatEvent & { type: 'photo' } => ({
      type: 'photo',
      timestamp: occurredAt,
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

  const messageRows = rows
    .filter(isMessageRow)
    .map(({ occurredAt, payload: { sentBy, message } }): ChatEvent & { type: 'message' } => ({
      type: 'message',
      timestamp: occurredAt,
      profilePicUrl: getProfilePicUrlForUser(sentBy),
      message: {
        body: message,
      },
    }))

  return [...photoRows, ...messageRows].sort((a, b) => a.timestamp - b.timestamp)
}

function isPhotoRow(row: any): row is UserUploadedPhotoToChat {
  return row.type === 'UserUploadedPhotoToChat'
}

function isFaceDetectedRow(row: any): row is FacesRecognizedInChatPhoto {
  return row.type === 'FacesRecognizedInChatPhoto'
}

function isMessageRow(row: any): row is UserSentMessageToChat {
  return row.type === 'UserSentMessageToChat'
}
