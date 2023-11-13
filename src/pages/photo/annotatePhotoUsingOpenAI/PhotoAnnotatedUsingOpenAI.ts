import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { DeductionId } from '../../../domain/DeductionId'
import { FaceId } from '../../../domain/FaceId'
import { PersonId } from '../../../domain/PersonId'
import { PhotoId } from '../../../domain/PhotoId'

type Deduction = {
  deductionId: DeductionId
  photoId: PhotoId
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
    photoId: PhotoId
    model: string
    prompt: string
    response?: string
    deductions: Deduction[]
  }
>

export const PhotoAnnotatedUsingOpenAI = makeDomainEvent<PhotoAnnotatedUsingOpenAI>('PhotoAnnotatedUsingOpenAI')
