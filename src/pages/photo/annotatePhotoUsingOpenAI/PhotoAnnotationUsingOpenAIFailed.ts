import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { PhotoId } from '../../../domain/PhotoId'

export type PhotoAnnotationUsingOpenAIFailed = DomainEvent<
  'PhotoAnnotationUsingOpenAIFailed',
  {
    photoId: PhotoId
    model: string
    prompt: string
    response?: string
    error?: string
  }
>

export const PhotoAnnotationUsingOpenAIFailed = makeDomainEvent<PhotoAnnotationUsingOpenAIFailed>(
  'PhotoAnnotationUsingOpenAIFailed'
)
