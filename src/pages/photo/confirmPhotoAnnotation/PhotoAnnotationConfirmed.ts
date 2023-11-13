import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { AppUserId } from '../../../domain/AppUserId'
import { DeductionId } from '../../../domain/DeductionId'
import { FaceId } from '../../../domain/FaceId'
import { PersonId } from '../../../domain/PersonId'
import { PhotoId } from '../../../domain/PhotoId'

export type PhotoAnnotationConfirmed = DomainEvent<
  'PhotoAnnotationConfirmed',
  {
    // I,
    confirmedBy: AppUserId
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
    photoId: PhotoId
    // as suggested by (if OpenAI)
    deductionId?: DeductionId
    // using this face (Rekognition)
    faceId: FaceId
  }
>

export const PhotoAnnotationConfirmed = makeDomainEvent<PhotoAnnotationConfirmed>('PhotoAnnotationConfirmed')
