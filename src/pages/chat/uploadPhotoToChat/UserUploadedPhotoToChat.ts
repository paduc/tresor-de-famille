import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

export type UserUploadedPhotoToChat = DomainEvent<
  'UserUploadedPhotoToChat',
  {
    chatId: UUID
    photoId: UUID
    location:
      | {
          type: 'S3'
          bucket: string
          endpoint: string
          key: string
        }
      | { type: 'localfile' }
    uploadedBy: UUID
  }
>

export const UserUploadedPhotoToChat = makeDomainEvent<UserUploadedPhotoToChat>('UserUploadedPhotoToChat')
