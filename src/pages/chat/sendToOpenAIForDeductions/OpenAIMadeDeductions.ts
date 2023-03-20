import { UUID } from '../../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../../libs/eventSourcing'

type Deduction = {
  deductionId: UUID
  personId: UUID
  faceId: UUID
  photoId: UUID
} & (
  | {
      type: 'face-is-person'
    }
  | {
      type: 'face-is-new-person'
      name: string
    }
)

export type OpenAIMadeDeductions = BaseDomainEvent & {
  type: 'OpenAIMadeDeductions'
  payload: {
    chatId: UUID
    promptId: UUID
    deductions: Deduction[]
  }
}

export const OpenAIMadeDeductions = (payload: OpenAIMadeDeductions['payload']): OpenAIMadeDeductions =>
  makeDomainEvent({
    type: 'OpenAIMadeDeductions',
    payload,
  })
