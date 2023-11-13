import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'

export type UserNamedPersonInPhoto = DomainEvent<
  'UserNamedPersonInPhoto',
  {
    faceId: FaceId
    photoId: UUID

    personId: PersonId
    name: string

    userId: UUID
  }
>

export const UserNamedPersonInPhoto = makeDomainEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto')
