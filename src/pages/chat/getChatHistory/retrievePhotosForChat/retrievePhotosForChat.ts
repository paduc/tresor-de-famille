import { postgres } from '../../../../dependencies/database'
import { normalizeBBOX } from '../../../../dependencies/face-recognition'
import { getPhotoUrlFromId, getProfilePicUrlForUser } from '../../../../dependencies/photo-storage'
import { UUID } from '../../../../domain'
import { getPersonById } from '../../../_getPersonById'
import { ChatEvent } from '../../ChatPage/ChatPage'
import { UserUploadedPhotoToChat } from '../../uploadPhotoToChat/UserUploadedPhotoToChat'
import { makeAugmentChatPhotosWithFacesDetected } from './augmentChatPhotosWithFacesDetected'
import { makeAugmentChatPhotosWithPersonsDeducted } from './augmentChatPhotosWithPersonsDeducted'

const augmentChatPhotosWithFacesDetected = makeAugmentChatPhotosWithFacesDetected({
  getPersonById,
  normalizeBBOX,
})

const augmentChatPhotosWithPersonsDeducted = makeAugmentChatPhotosWithPersonsDeducted({ getPersonById })

export type ChatPhotoEvent = ChatEvent & { type: 'photo' }
export async function retrievePhotosForChat(chatId: UUID): Promise<ChatPhotoEvent[]> {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1",
    [chatId]
  )

  const photoRows = photoRowsRes.map(({ occurredAt, payload: { uploadedBy, photoId } }): ChatEvent & { type: 'photo' } => ({
    type: 'photo',
    timestamp: occurredAt.getTime(),
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
