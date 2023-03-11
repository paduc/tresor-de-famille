import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

type Deduction = {
  type: 'face-is-person'
  personId: string
  faceId: string
}

export type OpenAIMadeDeductions = BaseDomainEvent & {
  type: 'OpenAIMadeDeductions'
  payload: {
    chatId: UUID
    promptId: UUID
    messageId: UUID
    deductions: Deduction[]
  }
}

export const OpenAIMadeDeductions = (payload: OpenAIMadeDeductions['payload']): OpenAIMadeDeductions =>
  makeDomainEvent({
    type: 'OpenAIMadeDeductions',
    payload,
  })
