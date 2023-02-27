import { postgres } from '../../dependencies/postgres'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../dependencies/uploadPhoto'
import { UUID } from '../../domain'
import { ChatPageProps } from './ChatPage'
import { UserUploadedPhotoToChat } from './UserUploadedPhotoToChat'

export const getChatHistory = async (chatId: UUID): Promise<ChatPageProps['history']> => {
  const { rows } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type = 'UserUploadedPhotoToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  return rows.map(({ payload: { photoId, uploadedBy } }) => ({
    type: 'photo',
    profilePicUrl: getProfilePicUrlForUser(uploadedBy),
    photo: {
      id: photoId,
      url: getPhotoUrlFromId(photoId),
    },
  }))
}
