import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

export type UserNamedPersonInPhoto = DomainEvent<
  'UserNamedPersonInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    personId: PersonId
    name: string

    userId: AppUserId
  }
>

export const UserNamedPersonInPhoto = makeDomainEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto')
