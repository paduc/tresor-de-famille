import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'
import { UUID } from '../../domain/UUID'

export type UserConfirmedHisFace = DomainEvent<
  'UserConfirmedHisFace',
  {
    userId: UUID
    faceId: FaceId
    photoId: UUID
    personId: UUID
  }
>

export const UserConfirmedHisFace = makeDomainEvent<UserConfirmedHisFace>('UserConfirmedHisFace')
