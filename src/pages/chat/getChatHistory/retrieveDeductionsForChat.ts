import { postgres } from '../../../dependencies/postgres'
import { normalizeBBOX } from '../../../dependencies/rekognition'
import { getPhotoUrlFromId } from '../../../dependencies/uploadPhoto'
import { UUID } from '../../../domain'
import { getPersonByIdOrThrow } from '../../_getPersonById'
import { ChatEvent } from '../ChatPage/ChatPage'
import { FacesDetectedInChatPhoto } from '../recognizeFacesInChatPhoto/FacesDetectedInChatPhoto'
import { OpenAIMadeDeductions } from '../sendToOpenAIForDeductions/OpenAIMadeDeductions'

type ChatDeductionEvent = ChatEvent & { type: 'deductions' }
type ChatDeduction = ChatDeductionEvent['deductions'][number]
export async function retrieveDeductionsForChat(chatId: UUID): Promise<ChatDeductionEvent[]> {
  const { rows: deductionsRowsRes } = await postgres.query<OpenAIMadeDeductions>(
    "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1",
    [chatId]
  )

  const deductionsRows: ChatDeductionEvent[] = []
  for (const deductionsRow of deductionsRowsRes) {
    const deductions: ChatDeduction[] = []
    for (const { personId, faceId, photoId } of deductionsRow.payload.deductions) {
      try {
        const position = await getFaceBBoxInPhoto(faceId, photoId)
        const { name } = await getPersonByIdOrThrow(personId)

        deductions.push({
          person: { name },
          faceId,
          photo: {
            url: getPhotoUrlFromId(photoId),
          },
          position,
        })
      } catch (error) {
        throw error
      }
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

const getFaceBBoxInPhoto = async (faceId: UUID, photoId: UUID): Promise<Position> => {
  const { rows } = await postgres.query<FacesDetectedInChatPhoto>(
    "SELECT * FROM events WHERE type = 'FacesDetectedInChatPhoto' AND payload->>'photoId'=$1 ORDER BY occurred_at ASC",
    [photoId]
  )

  if (!rows.length) {
    throw new Error('FacesDetectedInChatPhoto introuvable')
  }

  type FaceId = UUID

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
