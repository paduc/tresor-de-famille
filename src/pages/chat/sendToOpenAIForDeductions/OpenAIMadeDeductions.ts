import { UUID } from '../../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../../libs/eventSourcing'

type Deduction = {
  personId: string
  faceId: string
  photoId: string
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
