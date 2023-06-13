import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

export type OpenAIPrompted = DomainEvent<
  'OpenAIPrompted',
  {
    chatId: UUID
    promptId: UUID
    promptedBy: UUID
    model: string
    prompt: string
    response?: string
  }
>

export const OpenAIPrompted = makeDomainEvent<OpenAIPrompted>('OpenAIPrompted')
