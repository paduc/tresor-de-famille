import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent.js'
import { AppUserId } from '../../../domain/AppUserId.js'
import { FamilyId } from '../../../domain/FamilyId.js'
import { PhotoId } from '../../../domain/PhotoId.js'
import { ThreadId } from '../../../domain/ThreadId.js'

export type PhotoLocation =
  | {
      type: 'S3'
      bucket: string
      endpoint: string
      key: string
    }
  | { type: 'localfile' }

export type UserUploadedPhotoToChat = DomainEvent<
  'UserUploadedPhotoToChat',
  {
    threadId: ThreadId
    photoId: PhotoId
    location: PhotoLocation
    userId: AppUserId
    familyId: FamilyId
  }
>

/**
 * @deprecated
 */
export const UserUploadedPhotoToChat = makeDomainEvent<UserUploadedPhotoToChat>('UserUploadedPhotoToChat')
