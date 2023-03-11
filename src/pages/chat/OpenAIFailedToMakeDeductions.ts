import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type OpenAIFailedToMakeDeductions = BaseDomainEvent & {
  type: 'OpenAIFailedToMakeDeductions'
  payload: {
    chatId: UUID
    promptId: UUID
    errorMessage: string
  }
}

export const OpenAIFailedToMakeDeductions = (payload: OpenAIFailedToMakeDeductions['payload']): OpenAIFailedToMakeDeductions =>
  makeDomainEvent({
    type: 'OpenAIFailedToMakeDeductions',
    payload,
  })
