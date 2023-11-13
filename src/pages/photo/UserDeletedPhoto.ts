import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { PhotoId } from '../../domain/PhotoId'

export type UserDeletedPhoto = DomainEvent<
  'UserDeletedPhoto',
  {
    photoId: PhotoId
    userId: UUID
  }
>

export const UserDeletedPhoto = makeDomainEvent<UserDeletedPhoto>('UserDeletedPhoto')
