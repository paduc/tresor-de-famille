import { postgres } from '../../dependencies/database'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'

export const getPhotos = async (userId: UUID): Promise<{ photoId: UUID; chatId: UUID; url: string }[]> => {
  const { rows } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type = 'UserUploadedPhotoToChat' AND payload->>'uploadedBy'=$1",
    [userId]
  )

  return rows.map((row) => ({
    photoId: row.payload.photoId,
    chatId: row.payload.chatId,
    url: getPhotoUrlFromId(row.payload.photoId),
  }))
}
