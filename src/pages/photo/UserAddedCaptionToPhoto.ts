import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { UUID } from '../../domain/UUID.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'

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
