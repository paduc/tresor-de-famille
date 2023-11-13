import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { ThreadId } from '../../../domain/ThreadId'

export type OpenAIFailedToMakeDeductions = DomainEvent<
  'OpenAIFailedToMakeDeductions',
  {
    chatId: ThreadId
    promptId: UUID
    errorMessage: string
  }
>

export const OpenAIFailedToMakeDeductions = makeDomainEvent<OpenAIFailedToMakeDeductions>('OpenAIFailedToMakeDeductions')
