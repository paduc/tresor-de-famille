import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

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

export type OpenAIMadeDeductions = DomainEvent<
  'OpenAIMadeDeductions',
  {
    chatId: UUID
    promptId: UUID
    deductions: Deduction[]
  }
>

export const OpenAIMadeDeductions = makeDomainEvent<OpenAIMadeDeductions>('OpenAIMadeDeductions')
