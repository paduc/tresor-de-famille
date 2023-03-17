import { postgres } from '../../dependencies/postgres'
import { normalizeBBOX } from '../../dependencies/rekognition'
import { getPhotoUrlFromId } from '../../dependencies/uploadPhoto'
import { UUID } from '../../domain'
import { GedcomImported } from '../../events/GedcomImported'
import { FacesDetectedInChatPhoto } from '../chat/recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
import { OpenAIMadeDeductions } from '../chat/sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoFace, PhotoPageProps } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'

export const getPhoto = async (chatId: UUID): Promise<PhotoPageProps['photo']> => {
  const { rows: photoRowsRes } = await postgres.query<UserUploadedPhotoToChat>(
    "SELECT * FROM events WHERE type='UserUploadedPhotoToChat' AND payload->>'chatId'=$1 ORDER BY occurred_at DESC",
    [chatId]
  )

  const photoRow = photoRowsRes[0]?.payload

  if (!photoRow) return null

  const { photoId } = photoRow

  const detectedFaces = await getDetectedFaces(chatId, photoId)
  // We have a list of faceId and positions from rekognition

  // To do: remove personId from the payload of FacesDetectedInChatPhoto
  // done : Renamed FacesDetectedInChatPhoto
  // done : Removed personId from event (will be call during query)

  // Next: get the list of faceId + personIds from AI deductions
  const faceIdToPersonIdDeductions = detectedFaces.length
    ? await getFaceIdToPersonIdDeductions(chatId, photoId)
    : new Map<string, string>()

  // For each detectedFace, check for a
  const faces: PhotoFace[] = []
  for (const { faceId, position } of detectedFaces) {
    // first, if a deduction has been made, use it
    const personIdFromDeductions = faceIdToPersonIdDeductions.get(faceId)
    if (personIdFromDeductions) {
      faces.push({
        faceId,
        position,
        person: { name: await getPersonNameById(personIdFromDeductions), annotatedBy: 'ai' },
      })

      continue
    }

    // next, search the faceId-personId index
    const personIdFromIndex = await getPersonIdForFaceId(faceId)
    if (personIdFromIndex) {
      faces.push({
        faceId,
        position,
        person: { name: await getPersonNameById(personIdFromIndex), annotatedBy: 'face-recognition' },
      })

      continue
    }

    // else return the faceId without a person
    faces.push({
      faceId,
      position,
      person: null,
    })
  }

  const captions = await getCaptionsForPhoto(chatId, photoId)

  return {
    id: photoId,
    url: getPhotoUrlFromId(photoId),
    faces,
    captions,
  }
}

const getPersonNameById = async (personId: string): Promise<string> => {
  type PersonId = string
  type PersonName = string

  const personIdMap = new Map<PersonId, PersonName>()

  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (gedcomImportedRows.length) {
    const gedcomPersons = gedcomImportedRows[0].payload.persons
    for (const { id, name } of gedcomPersons) {
      personIdMap.set(id, name)
    }
  }

  const { rows: deductionRows } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type = 'OpenAIMadeDeductions' ORDER BY occurred_at ASC"
  )
  for (const { payload } of deductionRows) {
    const personsFromDeductions = payload.deductions.filter(isNewPersonDeduction)

    for (const { personId, name } of personsFromDeductions) {
      personIdMap.set(personId, name)
    }
  }

  const personName = personIdMap.get(personId)

  if (!personName) throw new Error('person could not be found')

  return personName
}

type Deduction = OpenAIMadeDeductions['payload']['deductions'][number]
function isNewPersonDeduction(deduction: Deduction): deduction is Deduction & { type: 'face-is-new-person' } {
  return deduction.type === 'face-is-new-person'
}

type FaceId = string
type PersonId = string
async function getFaceIdToPersonIdDeductions(chatId: UUID, photoId: UUID): Promise<Map<FaceId, PersonId>> {
  const { rows: openAIMadeDeductionRows } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1 ORDER BY occurred_at ASC",
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

async function getCaptionsForPhoto(chatId: UUID, photoId: UUID) {
  const { rows } = await postgres.query<UserAddedCaptionToPhoto>(
    "SELECT * FROM events WHERE type='UserAddedCaptionToPhoto' AND payload->>'chatId'=$1 AND payload->>'photoId'=$2",
    [chatId, photoId]
  )

  return rows.map((row) => row.payload.caption)
}

const getPersonIdForFaceId = async (faceId: string): Promise<string | null> => {
  // For now, the only link is from OpenAI api calls
  const { rows } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type = 'OpenAIMadeDeductions' ORDER BY occurred_at DESC"
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
