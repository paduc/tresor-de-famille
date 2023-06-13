import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

export type OpenAIFailedToMakeDeductions = DomainEvent<
  'OpenAIFailedToMakeDeductions',
  {
    chatId: UUID
    promptId: UUID
    errorMessage: string
  }
>

export const OpenAIFailedToMakeDeductions = makeDomainEvent<OpenAIFailedToMakeDeductions>('OpenAIFailedToMakeDeductions')
