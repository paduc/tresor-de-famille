import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { ThreadId } from '../../../domain/ThreadId'

export type OpenAIPrompted = DomainEvent<
  'OpenAIPrompted',
  {
    chatId: ThreadId
    promptId: UUID
    promptedBy: UUID
    model: string
    prompt: string
    response?: string
  }
>

export const OpenAIPrompted = makeDomainEvent<OpenAIPrompted>('OpenAIPrompted')
