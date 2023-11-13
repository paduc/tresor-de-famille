import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { TipTapContentAsJSON } from './TipTapTypes'
import { PhotoLocation } from './uploadPhotoToChat/UserUploadedPhotoToChat'

export type UserInsertedPhotoInRichTextThread = DomainEvent<
  'UserInsertedPhotoInRichTextThread',
  {
    photoId: PhotoId
    chatId: ThreadId
    userId: AppUserId
    location: PhotoLocation
    contentAsJSON: TipTapContentAsJSON
  }
>

export const UserInsertedPhotoInRichTextThread = makeDomainEvent<UserInsertedPhotoInRichTextThread>(
  'UserInsertedPhotoInRichTextThread'
)
