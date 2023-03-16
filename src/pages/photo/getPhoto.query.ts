import { postgres } from '../../dependencies/postgres'
import { normalizeBBOX } from '../../dependencies/rekognition'
import { getPhotoUrlFromId } from '../../dependencies/uploadPhoto'
import { UUID } from '../../domain'
import { getPersonById } from '../chat/getPersonById.query'
import { FacesRecognizedInChatPhoto } from '../chat/recognizeFacesInChatPhoto/FacesRecognizedInChatPhoto'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoFace, PhotoPageProps } from './PhotoPage/PhotoPage'

export const getPhoto = async (chatId: UUID): Promise<PhotoPageProps['photo']> => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1 ORDER BY occurred_at DESC",
    [chatId]
  )

  const photoRow = photoRowsRes[0]?.payload

  if (!photoRow) throw new Error('Photo introuvable')

  const { photoId } = photoRow

  // TODO: augment with faces
  const faceIds: { faceId: string; position: PhotoFace['position'] }[] = []

  const { rows: faceDetectedRowsRes } = await postgres.query<FacesRecognizedInChatPhoto>(
    "SELECT * FROM events WHERE type='FacesRecognizedInChatPhoto' AND payload->>'chatId'=$1",
    [chatId]
  )
  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload).filter((faceRow) => faceRow.photoId === photoId)
  for (const facesDetectedRow of facesDetectedRows) {
    for (const awsFace of facesDetectedRow.faces) {
      faceIds.push({
        faceId: awsFace.AWSFaceId,
        position: normalizeBBOX(awsFace.position),
      })
    }
  }

  // We have a list of faceId and positions from rekognition

  // To ponder: remove personId from the payload of FacesRecognizedInChatPhoto

  // Next: get the list of faceId + personIds from AI deductions

  // Next: fetch the latest faceId-personId correspondances

  // Last : enrich personId => person { name }

  return {
    id: photoId,
    url: getPhotoUrlFromId(photoId),
  }
}
