import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { TipTapContentAsJSON } from './TipTapTypes'
import { PhotoLocation } from './uploadPhotoToChat/UserUploadedPhotoToChat'

export type UserInsertedPhotoInRichTextThread = DomainEvent<
  'UserInsertedPhotoInRichTextThread',
  {
    photoId: PhotoId
    threadId: ThreadId
    userId: AppUserId
    location: PhotoLocation
    contentAsJSON: TipTapContentAsJSON
    familyId: FamilyId
  }
>

export const UserInsertedPhotoInRichTextThread = makeDomainEvent<UserInsertedPhotoInRichTextThread>(
  'UserInsertedPhotoInRichTextThread'
)
