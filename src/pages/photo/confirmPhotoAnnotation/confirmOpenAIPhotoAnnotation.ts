import { addToHistory } from '../../../dependencies/addToHistory'
import { postgres } from '../../../dependencies/database'
import { normalizeBBOX } from '../../../dependencies/face-recognition'
import { UUID } from '../../../domain'
import { PhotoAnnotationConfirmed } from './PhotoAnnotationConfirmed'
import { PhotoAnnotatedUsingOpenAI } from '../annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import { AWSDetectedFacesInPhoto } from '../recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { personsIndex, searchClient } from '../../../dependencies/search'

type ConfirmOpenAIPhotoAnnotationArgs = {
  photoId: UUID
  deductionId: UUID
  confirmedBy: UUID
}

export const confirmOpenAIPhotoAnnotation = async ({ photoId, deductionId, confirmedBy }: ConfirmOpenAIPhotoAnnotationArgs) => {
  const deduction = await getDeductionById(photoId, deductionId)

  if (!deduction) throw new Error('Could not find deduction for this deductionId and photoId')

  const { faceId, personId } = deduction

  const face = await getFaceById(photoId, faceId)

  if (!face) throw new Error('Could not find face for this photoId and faceId')

  const position = normalizeBBOX(face.position)

  await addToHistory(
    PhotoAnnotationConfirmed({
      photoId,
      personId,
      faceId,
      position,
      deductionId,
      confirmedBy,
    })
  )

  if (deduction.type === 'face-is-new-person') {
    try {
      await personsIndex.saveObject({
        objectID: personId,
        personId,
        name: deduction.name,
        visible_by: [`person/${personId}`, `user/${confirmedBy}`],
      })
    } catch (error) {
      console.error('Could not add new person to algolia index', error)
    }
  }
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

async function getDeductionById(photoId: UUID, deductionId: UUID) {
  const { rows } = await postgres.query<PhotoAnnotatedUsingOpenAI>(
    "SELECT * FROM history WHERE type='PhotoAnnotatedUsingOpenAI' AND payload->>'photoId'=$1",
    [photoId]
  )

  const deductions = rows.flatMap((row) => row.payload.deductions)

  const deduction = deductions.find((deduction) => deduction.deductionId === deductionId)
  return deduction
}
