import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type OpenAIPrompted = BaseDomainEvent & {
  type: 'OpenAIPrompted'
  payload: {
    chatId: UUID
    promptId: UUID
    promptedBy: UUID
    model: string
    prompt: string
    response: string | undefined
  }
}

export const OpenAIPrompted = (payload: OpenAIPrompted['payload']): OpenAIPrompted =>
  makeDomainEvent({
    type: 'OpenAIPrompted',
    payload,
  })
