import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'

export type UserRecognizedPersonInPhoto = DomainEvent<
  'UserRecognizedPersonInPhoto',
  {
    faceId: FaceId
    photoId: UUID

    personId: PersonId

    userId: UUID
  }
>

export const UserRecognizedPersonInPhoto = makeDomainEvent<UserRecognizedPersonInPhoto>('UserRecognizedPersonInPhoto')
