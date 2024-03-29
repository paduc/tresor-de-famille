import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserDeletedPhoto = DomainEvent<
  'UserDeletedPhoto',
  {
    photoId: PhotoId
    userId: AppUserId
  }
>

export const UserDeletedPhoto = makeDomainEvent<UserDeletedPhoto>('UserDeletedPhoto')
