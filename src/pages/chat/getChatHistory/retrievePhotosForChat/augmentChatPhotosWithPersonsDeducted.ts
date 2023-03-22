import { postgres } from '../../../../dependencies/database'
import { UUID } from '../../../../domain'
import { ChatPhotoFace } from '../../ChatPage/ChatPage'
import { OpenAIMadeDeductions } from '../../sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { ChatPhotoEvent } from './retrievePhotosForChat'

type AugmentChatPhotosWithPersonsDeductedDeps = {
  getPersonById: (personId: UUID) => Promise<ChatPhotoFace['person']>
}

export const makeAugmentChatPhotosWithPersonsDeducted = ({ getPersonById }: AugmentChatPhotosWithPersonsDeductedDeps) =>
  async function augmentChatPhotosWithPersonsDeducted(chatId: UUID, photoRows: ChatPhotoEvent[]) {
    const { rows: openAIMadeDeductionRows } = await postgres.query<OpenAIMadeDeductions>(
      "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1 ORDER BY occurred_at ASC",
      [chatId]
    )

    type FaceId = UUID
    type PersonId = UUID
    const faceIdToPersonId = new Map<FaceId, PersonId>()
    for (const deductionRow of openAIMadeDeductionRows) {
      for (const deduction of deductionRow.payload.deductions) {
        if (deduction.type === 'face-is-person') {
          faceIdToPersonId.set(deduction.faceId, deduction.personId)
        }
      }
    }

    for (const photo of photoRows) {
      if (!photo.photo.faces) continue
      for (const face of photo.photo.faces) {
        const personId = faceIdToPersonId.get(face.faceId)
        if (personId) {
          face.person = await getPersonById(personId)
        }
      }
    }
  }
