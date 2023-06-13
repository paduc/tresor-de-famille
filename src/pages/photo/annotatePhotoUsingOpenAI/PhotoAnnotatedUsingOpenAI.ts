import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

type Deduction = {
  deductionId: UUID
  photoId: UUID
} & (
  | {
      type: 'face-is-person'
      personId: UUID
      faceId: UUID
    }
  | {
      type: 'face-is-new-person'
      name: string
      personId: UUID
      faceId: UUID
    }
)

export type PhotoAnnotatedUsingOpenAI = DomainEvent<
  'PhotoAnnotatedUsingOpenAI',
  {
    photoId: UUID
    model: string
    prompt: string
    response?: string
    deductions: Deduction[]
  }
>

export const PhotoAnnotatedUsingOpenAI = makeDomainEvent<PhotoAnnotatedUsingOpenAI>('PhotoAnnotatedUsingOpenAI')
