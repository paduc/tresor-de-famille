import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { PhotoId } from '../../../domain/PhotoId'

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
    chatId: UUID
    photoId: PhotoId
    location: PhotoLocation
    uploadedBy: UUID
  }
>

export const UserUploadedPhotoToChat = makeDomainEvent<UserUploadedPhotoToChat>('UserUploadedPhotoToChat')
