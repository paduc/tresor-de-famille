import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { FaceId } from '../../../domain/FaceId'

type Deduction = {
  deductionId: UUID
  photoId: UUID
} & (
  | {
      type: 'face-is-person'
      personId: UUID
      faceId: FaceId
    }
  | {
      type: 'face-is-new-person'
      name: string
      personId: UUID
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
