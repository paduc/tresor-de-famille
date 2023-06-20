import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { normalizeBBOX } from '../../../dependencies/face-recognition'
import { UUID } from '../../../domain'
import { PhotoAnnotationConfirmed } from './PhotoAnnotationConfirmed'
import { PhotoAnnotatedUsingOpenAI } from '../annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

type ConfirmAWSPhotoAnnotationArgs = {
  photoId: UUID
  personId: UUID
  faceId: UUID
  confirmedBy: UUID
}

export const confirmAWSPhotoAnnotation = async ({ photoId, faceId, personId, confirmedBy }: ConfirmAWSPhotoAnnotationArgs) => {
  const face = await getFaceById(photoId, faceId)

  if (!face) throw new Error('Could not find face for this photoId and faceId')

  const position = normalizeBBOX(face.position)

  await addToHistory(
    PhotoAnnotationConfirmed({
      photoId,
      personId,
      faceId,
      position,
      confirmedBy,
    })
  )
}

async function getFaceById(photoId: UUID, faceId: UUID) {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )

  const faces = rows.flatMap((row) => row.payload.faces)

  const face = faces.find((face) => face.faceId === faceId)
  return face
}