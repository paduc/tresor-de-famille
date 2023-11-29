import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

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
