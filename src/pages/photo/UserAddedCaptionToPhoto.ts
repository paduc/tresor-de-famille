import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/addToHistory'

export type UserAddedCaptionToPhoto = DomainEvent<
  'UserAddedCaptionToPhoto',
  {
    chatId: UUID
    photoId: UUID
    caption: {
      id: UUID
      body: string
    }
    addedBy: UUID
  }
>

export const UserAddedCaptionToPhoto = makeDomainEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto')
