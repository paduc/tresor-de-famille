import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'

export type UserDeletedPhoto = DomainEvent<
  'UserDeletedPhoto',
  {
    photoId: PhotoId
    userId: AppUserId
  }
>

export const UserDeletedPhoto = makeDomainEvent<UserDeletedPhoto>('UserDeletedPhoto')
