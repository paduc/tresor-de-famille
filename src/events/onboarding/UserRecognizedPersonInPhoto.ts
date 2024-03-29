import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserRecognizedPersonInPhoto = DomainEvent<
  'UserRecognizedPersonInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    personId: PersonId

    userId: AppUserId
  }
>

export const UserRecognizedPersonInPhoto = makeDomainEvent<UserRecognizedPersonInPhoto>('UserRecognizedPersonInPhoto')
