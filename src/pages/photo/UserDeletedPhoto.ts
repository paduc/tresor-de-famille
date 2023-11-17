import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'

export type UserDeletedPhoto = DomainEvent<
  'UserDeletedPhoto',
  {
    photoId: PhotoId
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserDeletedPhoto = makeDomainEvent<UserDeletedPhoto>('UserDeletedPhoto')
