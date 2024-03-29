import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { TipTapContentAsJSON } from './TipTapTypes.js'
import { PhotoLocation } from './uploadPhotoToChat/UserUploadedPhotoToChat.js'

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

/**
 * @deprecated
 * Used to add a photo to a Thread.
 * Replaced by clientside addition => UserUpdatedThreadAsRichText
 */
export const UserInsertedPhotoInRichTextThread = undefined
