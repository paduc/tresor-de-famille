import { postgres } from '../../dependencies/postgres'
import { normalizeBBOX } from '../../dependencies/rekognition'
import { getPhotoUrlFromId } from '../../dependencies/uploadPhoto'
import { UUID } from '../../domain'
import { getPersonById } from '../chat/getPersonById.query'
import { FacesDetectedInChatPhoto } from '../chat/recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
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
  const detectedFaces = await getDetectedFaces(chatId, photoId)

  // We have a list of faceId and positions from rekognition

  // To ponder: remove personId from the payload of FacesDetectedInChatPhoto

  // Next: get the list of faceId + personIds from AI deductions

  // Next: fetch the latest faceId-personId correspondances

  // Last : enrich personId => person { name }

  return {
    id: photoId,
    url: getPhotoUrlFromId(photoId),
  }
}

async function getDetectedFaces(chatId: UUID, photoId: UUID) {
  const detectedFaces: { faceId: string; position: PhotoFace['position'] }[] = []

  const { rows: faceDetectedRowsRes } = await postgres.query<FacesDetectedInChatPhoto>(
    "SELECT * FROM events WHERE type='FacesDetectedInChatPhoto' AND payload->>'chatId'=$1",
    [chatId]
  )
  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload).filter((faceRow) => faceRow.photoId === photoId)
  for (const facesDetectedRow of facesDetectedRows) {
    for (const awsFace of facesDetectedRow.faces) {
      detectedFaces.push({
        faceId: awsFace.faceId,
        position: normalizeBBOX(awsFace.position),
      })
    }
  }

  return detectedFaces
}
