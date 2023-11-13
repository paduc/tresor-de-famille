import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'
import { FaceId } from '../../../domain/FaceId'
import { PersonId } from '../../../domain/PersonId'

export type PhotoManuallyAnnotated = DomainEvent<
  'PhotoManuallyAnnotated',
  {
    // I,
    annotatedBy: UUID
    // recognized the following
    personId: PersonId
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
    faceId: FaceId
  }
>

export const PhotoManuallyAnnotated = makeDomainEvent<PhotoManuallyAnnotated>('PhotoManuallyAnnotated')
