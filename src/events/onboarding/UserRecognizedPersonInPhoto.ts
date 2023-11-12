import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FaceId } from '../../domain/FaceId'

export type UserRecognizedPersonInPhoto = DomainEvent<
  'UserRecognizedPersonInPhoto',
  {
    faceId: FaceId
    photoId: UUID

    personId: UUID

    userId: UUID
  }
>

export const UserRecognizedPersonInPhoto = makeDomainEvent<UserRecognizedPersonInPhoto>('UserRecognizedPersonInPhoto')
