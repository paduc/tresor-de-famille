import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { AppUserId } from '../../../domain/AppUserId'
import { FaceId } from '../../../domain/FaceId'
import { FamilyId } from '../../../domain/FamilyId'
import { PersonId } from '../../../domain/PersonId'
import { PhotoId } from '../../../domain/PhotoId'

export type PhotoManuallyAnnotated = DomainEvent<
  'PhotoManuallyAnnotated',
  {
    // I,
    annotatedBy: AppUserId
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
    // using this face (Rekognition)
    faceId: FaceId

    familyId: FamilyId
  }
>

export const PhotoManuallyAnnotated = makeDomainEvent<PhotoManuallyAnnotated>('PhotoManuallyAnnotated')
