import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'

export type UserConfirmedHisFace = DomainEvent<
  'UserConfirmedHisFace',
  {
    userId: AppUserId
    faceId: FaceId
    photoId: PhotoId
    personId: PersonId
  }
>

export const UserConfirmedHisFace = makeDomainEvent<UserConfirmedHisFace>('UserConfirmedHisFace')
