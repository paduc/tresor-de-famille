import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

export type PhotoAnnotationUsingOpenAIFailed = DomainEvent<
  'PhotoAnnotationUsingOpenAIFailed',
  {
    photoId: UUID
    model: string
    prompt: string
    response?: string
    error?: string
  }
>

export const PhotoAnnotationUsingOpenAIFailed = makeDomainEvent<PhotoAnnotationUsingOpenAIFailed>(
  'PhotoAnnotationUsingOpenAIFailed'
)
