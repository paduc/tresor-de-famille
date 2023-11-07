import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type UserDeletedPhoto = DomainEvent<
  'UserDeletedPhoto',
  {
    photoId: UUID
    userId: UUID
  }
>

export const UserDeletedPhoto = makeDomainEvent<UserDeletedPhoto>('UserDeletedPhoto')
