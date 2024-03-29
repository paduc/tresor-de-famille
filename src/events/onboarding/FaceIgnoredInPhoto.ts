import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type FaceIgnoredInPhoto = DomainEvent<
  'FaceIgnoredInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    ignoredBy: AppUserId
  }
>

export const FaceIgnoredInPhoto = makeDomainEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto')
