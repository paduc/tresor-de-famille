import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserSelectedNewProfilePic = DomainEvent<
  'UserSelectedNewProfilePic',
  {
    personId: PersonId
    photoId: PhotoId
    faceId: FaceId
    userId: AppUserId
  }
>

export const UserSelectedNewProfilePic = makeDomainEvent<UserSelectedNewProfilePic>('UserSelectedNewProfilePic')
