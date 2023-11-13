import { DomainEvent, makeDomainEvent, JSON } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { TipTapContentAsJSON } from './TipTapTypes'
import { PhotoLocation } from './uploadPhotoToChat/UserUploadedPhotoToChat'

export type UserInsertedPhotoInRichTextThread = DomainEvent<
  'UserInsertedPhotoInRichTextThread',
  {
    photoId: PhotoId
    chatId: ThreadId
    userId: UUID
    location: PhotoLocation
    contentAsJSON: TipTapContentAsJSON
  }
>

export const UserInsertedPhotoInRichTextThread = makeDomainEvent<UserInsertedPhotoInRichTextThread>(
  'UserInsertedPhotoInRichTextThread'
)
