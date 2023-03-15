import { postgres } from '../../../../dependencies/postgres'
import { ChatPhotoFace } from '../../ChatPage/ChatPage'
import { OpenAIMadeDeductions } from '../../sendToOpenAIForDeductions/OpenAIMadeDeductions'
import { ChatPhotoEvent } from './retrievePhotosForChat'

type AugmentChatPhotosWithPersonsDeductedDeps = {
  getPersonById: (personId: string) => Promise<ChatPhotoFace['person']>
}

export const makeAugmentChatPhotosWithPersonsDeducted = ({ getPersonById }: AugmentChatPhotosWithPersonsDeductedDeps) =>
  async function augmentChatPhotosWithPersonsDeducted(chatId: string, photoRows: ChatPhotoEvent[]) {
    const { rows: openAIMadeDeductionRows } = await postgres.query<OpenAIMadeDeductions>(
      "SELECT * FROM events WHERE type='OpenAIMadeDeductions' AND payload->>'chatId'=$1 ORDER BY occurred_at ASC",
      [chatId]
    )

    type FaceId = string
    type PersonId = string
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
