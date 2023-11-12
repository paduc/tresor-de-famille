import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { normalizeBBOX } from '../../../dependencies/face-recognition'
import { FaceId } from '../../../domain/FaceId'
import { UUID } from '../../../domain/UUID'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { PhotoManuallyAnnotated } from './PhotoManuallyAnnotated'

type AnnotateManuallyArgs = {
  photoId: UUID
  faceId: FaceId
  personId: UUID
  annotatedBy: UUID
}

export const annotateManually = async ({ photoId, faceId, personId, annotatedBy }: AnnotateManuallyArgs) => {
  const face = await getFaceById(photoId, faceId)

  if (!face) throw new Error('Could not find face for this photoId and faceId')

  const position = normalizeBBOX(face.position)

  await addToHistory(
    PhotoManuallyAnnotated({
      photoId,
      personId,
      faceId,
      position,
      annotatedBy,
    })
  )
}

async function getFaceById(photoId: UUID, faceId: FaceId) {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )

  const faces = rows.flatMap((row) => row.payload.faces)

  const face = faces.find((face) => face.faceId === faceId)
  return face
}
