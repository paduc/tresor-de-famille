import { postgres } from '../../dependencies/database'
import { normalizeBBOX } from '../../dependencies/face-recognition'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { OpenAIMadeDeductions } from '../chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { PhotoFace, PhotoPageProps } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'

export const getPhoto = async (photoId: UUID): Promise<PhotoPageProps> => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM history WHERE type='UserUploadedPhotoToChat' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC",
    [photoId]
  )

  const photoRow = photoRowsRes[0]?.payload

  if (!photoRow) throw new Error('Unkown photo')

  const { chatId } = photoRow

  // const detectedFaces = await getDetectedFaces(photoId)
  // // We have a list of faceId and positions from rekognition

  // // To do: remove personId from the payload of FacesDetectedInChatPhoto
  // // done : Renamed FacesDetectedInChatPhoto
  // // done : Removed personId from event (will be call during query)

  // // Next: get the list of faceId + personIds from AI deductions
  // const faceIdToPersonIdDeductions = detectedFaces.length
  //   ? await getFaceIdToPersonIdDeductions(chatId, photoId)
  //   : new Map<UUID, UUID>()

  // // For each detectedFace, check for a
  // const faces: PhotoFace[] = []
  // for (const { faceId, position } of detectedFaces) {
  //   // first, if a deduction has been made, use it
  //   const personIdFromDeductions = faceIdToPersonIdDeductions.get(faceId)
  //   if (personIdFromDeductions) {
  //     const { name } = await getPersonByIdOrThrow(personIdFromDeductions)
  //     faces.push({
  //       faceId,
  //       position,
  //       person: { name, annotatedBy: 'ai' },
  //     })

  //     continue
  //   }

  //   // next, search the faceId-personId index
  //   const personIdFromIndex = await getPersonIdForFaceId(faceId)
  //   if (personIdFromIndex) {
  //     const { name } = await getPersonByIdOrThrow(personIdFromIndex)
  //     faces.push({
  //       faceId,
  //       position,
  //       person: { name, annotatedBy: 'face-recognition' },
  //     })

  //     continue
  //   }

  //   // else return the faceId without a person
  //   faces.push({
  //     faceId,
  //     position,
  //     person: null,
  //   })
  // }

  const caption = await getCaptionForPhoto(photoId)

  return {
    photoId,
    url: getPhotoUrlFromId(photoId),
    caption,
  }
}

type Deduction = OpenAIMadeDeductions['payload']['deductions'][number]
function isNewPersonDeduction(deduction: Deduction): deduction is Deduction & { type: 'face-is-new-person' } {
  return deduction.type === 'face-is-new-person'
}

type FaceId = UUID
type PersonId = UUID
async function getFaceIdToPersonIdDeductions(chatId: UUID, photoId: UUID): Promise<Map<FaceId, PersonId>> {
  const { rows: openAIMadeDeductionRows } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM history WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1 ORDER BY \"occurredAt\" ASC",
    [chatId]
  )

  const faceIdToPersonId = new Map<FaceId, PersonId>()

  for (const deductionRow of openAIMadeDeductionRows) {
    for (const deduction of deductionRow.payload.deductions) {
      if ((deduction.type === 'face-is-person' || deduction.type === 'face-is-new-person') && deduction.photoId === photoId) {
        faceIdToPersonId.set(deduction.faceId, deduction.personId)
      }
    }
  }

  return faceIdToPersonId
}

async function getDetectedFaces(photoId: UUID) {
  const detectedFaces: { faceId: UUID; position: PhotoFace['position'] }[] = []

  const { rows: faceDetectedRowsRes } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSFacesDetectedInChatPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )
  const facesDetectedRows = faceDetectedRowsRes.map((row) => row.payload)
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

async function getCaptionForPhoto(photoId: UUID) {
  const { rows } = await postgres.query<UserAddedCaptionToPhoto>(
    `SELECT * FROM history WHERE type='UserAddedCaptionToPhoto' AND payload->>'photoId'=$1 ORDER BY "occurredAt" DESC LIMIT 1`,
    [photoId]
  )

  return rows[0]?.payload.caption.body
}

const getPersonIdForFaceId = async (faceId: UUID): Promise<UUID | null> => {
  // For now, the only link is from OpenAI api calls
  const { rows } = await postgres.query<OpenAIMadeDeductions>(
    'SELECT * FROM history WHERE type = \'OpenAIMadeDeductions\' ORDER BY "occurredAt" DESC'
  )

  if (!rows.length) {
    return null
  }

  for (const { payload } of rows) {
    for (const { personId, faceId: deductionFaceId } of payload.deductions) {
      // latest deduction for this faceId wins
      if (faceId === deductionFaceId) {
        return personId
      }
    }
  }

  return null
}
