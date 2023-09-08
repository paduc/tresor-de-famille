import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain/UUID'

export type UserConfirmedHisFace = DomainEvent<
  'UserConfirmedHisFace',
  {
    userId: UUID
    faceId: UUID
    photoId: UUID
    personId: UUID
  }
>

export const UserConfirmedHisFace = makeDomainEvent<UserConfirmedHisFace>('UserConfirmedHisFace')
