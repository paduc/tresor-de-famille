import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { FaceId } from '../../../domain/FaceId'
import { PersonId } from '../../../domain/PersonId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'

type Deduction = {
  deductionId: UUID
  personId: PersonId
  faceId: FaceId
  photoId: PhotoId
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
    chatId: ThreadId
    promptId: UUID
    deductions: Deduction[]
  }
>

export const OpenAIMadeDeductions = makeDomainEvent<OpenAIMadeDeductions>('OpenAIMadeDeductions')
