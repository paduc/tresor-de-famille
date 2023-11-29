import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { PhotoId } from '../../domain/PhotoId'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export type UserAddedCaptionToPhoto = DomainEvent<
  'UserAddedCaptionToPhoto',
  {
    photoId: PhotoId
    caption: {
      id: UUID
      body: string
    }
    addedBy: AppUserId
  }
>

export const UserAddedCaptionToPhoto = makeDomainEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto')
