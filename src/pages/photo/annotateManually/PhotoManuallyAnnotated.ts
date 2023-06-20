import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type PhotoManuallyAnnotated = DomainEvent<
  'PhotoManuallyAnnotated',
  {
    // I,
    annotatedBy: UUID
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
    // using this face (Rekognition)
    faceId: UUID
  }
>

export const PhotoManuallyAnnotated = makeDomainEvent<PhotoManuallyAnnotated>('PhotoManuallyAnnotated')
