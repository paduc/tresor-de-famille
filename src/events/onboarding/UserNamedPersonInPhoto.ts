import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type UserNamedPersonInPhoto = DomainEvent<
  'UserNamedPersonInPhoto',
  {
    faceId: UUID
    photoId: UUID

    personId: UUID
    name: string

    userId: UUID
  }
>

export const UserNamedPersonInPhoto = makeDomainEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto')
