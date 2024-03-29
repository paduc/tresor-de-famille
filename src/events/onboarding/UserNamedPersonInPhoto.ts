import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserNamedPersonInPhoto = DomainEvent<
  'UserNamedPersonInPhoto',
  {
    faceId: FaceId
    photoId: PhotoId

    personId: PersonId
    name: string
    familyId: FamilyId

    userId: AppUserId
  }
>

export const UserNamedPersonInPhoto = makeDomainEvent<UserNamedPersonInPhoto>('UserNamedPersonInPhoto')
