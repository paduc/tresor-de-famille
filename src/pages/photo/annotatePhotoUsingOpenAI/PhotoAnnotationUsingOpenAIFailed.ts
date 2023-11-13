import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId } from '../../../domain/PhotoId'

export type PhotoAnnotationUsingOpenAIFailed = DomainEvent<
  'PhotoAnnotationUsingOpenAIFailed',
  {
    photoId: PhotoId
    model: string
    prompt: string
    response?: string
    error?: string
    familyId?: FamilyId
  }
>

export const PhotoAnnotationUsingOpenAIFailed = makeDomainEvent<PhotoAnnotationUsingOpenAIFailed>(
  'PhotoAnnotationUsingOpenAIFailed'
)
