import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type PhotoAnnotationConfirmed = DomainEvent<
  'PhotoAnnotationConfirmed',
  {
    // I,
    confirmedBy: UUID
    // recognized the following
    personId: UUID
    // as the person at this location
    position: {
      width: number
      height: number
      top: number
      left: number
    }
    // in this photo
    photoId: UUID
    // as suggested by (if OpenAI)
    deductionId?: UUID
    // using this face (Rekognition)
    faceId: UUID
  }
>

export const PhotoAnnotationConfirmed = makeDomainEvent<PhotoAnnotationConfirmed>('PhotoAnnotationConfirmed')
