import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'
import { PhotoId } from '../../domain/PhotoId'

export type FaceIgnoredInPhoto = DomainEvent<
  'FaceIgnoredInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    ignoredBy: UUID
  }
>

export const FaceIgnoredInPhoto = makeDomainEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto')
