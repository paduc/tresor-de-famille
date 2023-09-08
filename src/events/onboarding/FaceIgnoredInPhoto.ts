import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type FaceIgnoredInPhoto = DomainEvent<
  'FaceIgnoredInPhoto',
  {
    faceId: UUID
    photoId: UUID

    ignoredBy: UUID
  }
>

export const FaceIgnoredInPhoto = makeDomainEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto')
