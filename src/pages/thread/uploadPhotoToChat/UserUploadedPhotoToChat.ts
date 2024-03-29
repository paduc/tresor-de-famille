import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { PhotoId } from '../../../domain/PhotoId'
import { ThreadId } from '../../../domain/ThreadId'

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
