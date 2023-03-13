import { postgres } from '../../../dependencies/postgres'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../../dependencies/uploadPhoto'
import { ChatEvent } from '../ChatPage/ChatPage'
import { UserUploadedPhotoToChat } from '../uploadPhotoToChat/UserUploadedPhotoToChat'
import { augmentChatPhotosWithFacesDetected } from './augmentChatPhotosWithFacesDetected'

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
