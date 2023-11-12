import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'

export type UserNamedPersonInPhoto = DomainEvent<
  'UserNamedPersonInPhoto',
  {
    faceId: FaceId
    photoId: UUID

    personId: UUID
    name: string

    userId: UUID
  }
>

export const UserNamedPersonInPhoto = makeDomainEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto')
