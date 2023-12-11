import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'

export type UserAddedCaptionToPhoto = DomainEvent<
  'UserAddedCaptionToPhoto',
  {
    photoId: PhotoId
    caption: {
      id: UUID
      body: string
    }
    userId: AppUserId
  }
>

export const UserAddedCaptionToPhoto = makeDomainEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto')
