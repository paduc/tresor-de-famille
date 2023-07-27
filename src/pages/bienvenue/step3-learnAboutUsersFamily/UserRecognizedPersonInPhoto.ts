import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type UserRecognizedPersonInPhoto = DomainEvent<
  'UserRecognizedPersonInPhoto',
  {
    faceId: UUID
    photoId: UUID

    personId: UUID

    userId: UUID
  }
>

export const UserRecognizedPersonInPhoto = makeDomainEvent<UserRecognizedPersonInPhoto>('UserRecognizedPersonInPhoto')
