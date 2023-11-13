import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { FaceId } from '../../../domain/FaceId'
import { PersonId } from '../../../domain/PersonId'

type Deduction = {
  deductionId: UUID
  photoId: UUID
} & (
  | {
      type: 'face-is-person'
      personId: PersonId
      faceId: FaceId
    }
  | {
      type: 'face-is-new-person'
      name: string
      personId: PersonId
      faceId: FaceId
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
