import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'

export type FaceIgnoredInPhoto = DomainEvent<
  'FaceIgnoredInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    ignoredBy: AppUserId
  }
>

export const FaceIgnoredInPhoto = makeDomainEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto')
