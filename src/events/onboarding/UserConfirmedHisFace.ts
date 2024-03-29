import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserConfirmedHisFace = DomainEvent<
  'UserConfirmedHisFace',
  {
    userId: AppUserId
    faceId: FaceId
    photoId: PhotoId
    personId: PersonId

    familyId: FamilyId
  }
>

export const UserConfirmedHisFace = makeDomainEvent<UserConfirmedHisFace>('UserConfirmedHisFace')
