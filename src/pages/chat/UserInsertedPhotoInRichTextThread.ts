import { DomainEvent, makeDomainEvent, JSON } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { TipTapContentAsJSON } from './TipTapTypes'
import { PhotoLocation } from './uploadPhotoToChat/UserUploadedPhotoToChat'

export type UserInsertedPhotoInRichTextThread = DomainEvent<
  'UserInsertedPhotoInRichTextThread',
  {
    photoId: UUID
    chatId: UUID
    userId: UUID
    location: PhotoLocation
    contentAsJSON: TipTapContentAsJSON
  }
>

export const UserInsertedPhotoInRichTextThread = makeDomainEvent<UserInsertedPhotoInRichTextThread>(
  'UserInsertedPhotoInRichTextThread'
)
