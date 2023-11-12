import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'

export type FaceIgnoredInPhoto = DomainEvent<
  'FaceIgnoredInPhoto',
  {
    faceId: FaceId
    photoId: UUID

    ignoredBy: UUID
  }
>

export const FaceIgnoredInPhoto = makeDomainEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto')
