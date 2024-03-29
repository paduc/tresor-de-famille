import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent.js'
import { AppUserId } from '../../../domain/AppUserId.js'
import { FaceId } from '../../../domain/FaceId.js'
import { FamilyId } from '../../../domain/FamilyId.js'
import { PersonId } from '../../../domain/PersonId.js'
import { PhotoId } from '../../../domain/PhotoId.js'

export type PhotoManuallyAnnotated = DomainEvent<
  'PhotoManuallyAnnotated',
  {
    // I,
    userId: AppUserId
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
