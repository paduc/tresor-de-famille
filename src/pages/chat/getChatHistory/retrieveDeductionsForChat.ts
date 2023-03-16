import { postgres } from '../../../dependencies/postgres'
import { normalizeBBOX } from '../../../dependencies/rekognition'
import { getPhotoUrlFromId } from '../../../dependencies/uploadPhoto'
import { GedcomImported } from '../../../events/GedcomImported'
import { ChatEvent } from '../ChatPage/ChatPage'
import { FacesDetectedInChatPhoto } from '../recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
import { OpenAIMadeDeductions } from '../sendToOpenAIForDeductions/OpenAIMadeDeductions'

type ChatDeductionEvent = ChatEvent & { type: 'deductions' }
type ChatDeduction = ChatDeductionEvent['deductions'][number]
export async function retrieveDeductionsForChat(chatId: string): Promise<ChatDeductionEvent[]> {
  const { rows: deductionsRowsRes } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1",
    [chatId]
  )

  const deductionsRows: ChatDeductionEvent[] = []
  for (const deductionsRow of deductionsRowsRes) {
    const deductions: ChatDeduction[] = []
    for (const { personId, faceId, photoId } of deductionsRow.payload.deductions) {
      const person = await getPersonById(personId)
      const position = await getFaceBBoxInPhoto(faceId, photoId)

      deductions.push({
        person,
        faceId,
        photo: {
          url: getPhotoUrlFromId(photoId),
        },
        position,
      })
    }

    deductionsRows.push({
      type: 'deductions',
      timestamp: deductionsRow.occurredAt,
      deductions,
    })
  }

  return deductionsRows
}

type Position = ChatDeduction['position']

const getFaceBBoxInPhoto = async (faceId: string, photoId: string): Promise<Position> => {
  const { rows } = await postgres.query<FacesDetectedInChatPhoto>(
    "SELECT * FROM events WHERE type = 'FacesDetectedInChatPhoto' AND payload->>'photoId'=$1 ORDER BY occurred_at ASC",
    [photoId]
  )

  if (!rows.length) {
    throw new Error('FacesDetectedInChatPhoto introuvable')
  }

  type FaceId = string

  const faceBBoxMap = new Map<FaceId, Position>()

  for (const { payload } of rows) {
    for (const { faceId: AWSFaceId, position } of payload.faces) {
      faceBBoxMap.set(AWSFaceId, normalizeBBOX(position))
    }
  }

  const position = faceBBoxMap.get(faceId)

  if (!position) {
    throw new Error('faceId introuvable')
  }

  return position
}

const getPersonById = async (personId: string): Promise<ChatDeduction['person']> => {
  const { rows: gedcomImportedRows } = await postgres.query<GedcomImported>(
    "SELECT * FROM events WHERE type = 'GedcomImported' LIMIT 1"
  )

  if (!gedcomImportedRows.length) {
    throw 'GedcomImported introuvable'
  }

  type Person = GedcomImported['payload']['persons'][number]

  const person = gedcomImportedRows[0].payload.persons.find((person: Person) => person.id === personId)

  if (!person) throw new Error('person could not be found')

  return {
    name: person.name,
  }
}
