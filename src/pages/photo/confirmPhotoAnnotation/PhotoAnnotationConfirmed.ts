import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'
import { FaceId } from '../../../domain/FaceId'

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
    faceId: FaceId
  }
>

export const PhotoAnnotationConfirmed = makeDomainEvent<PhotoAnnotationConfirmed>('PhotoAnnotationConfirmed')
