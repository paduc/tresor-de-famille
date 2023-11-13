import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { UUID } from '../../domain/UUID'

export type UserConfirmedHisFace = DomainEvent<
  'UserConfirmedHisFace',
  {
    userId: UUID
    faceId: FaceId
    photoId: UUID
    personId: PersonId
  }
>

export const UserConfirmedHisFace = makeDomainEvent<UserConfirmedHisFace>('UserConfirmedHisFace')
