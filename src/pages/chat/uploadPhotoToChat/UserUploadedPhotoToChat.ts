import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/addToHistory'

export type UserUploadedPhotoToChat = DomainEvent<
  'UserUploadedPhotoToChat',
  {
    chatId: UUID
    photoId: UUID
    uploadedBy: UUID
  }
>

export const UserUploadedPhotoToChat = makeDomainEvent<UserUploadedPhotoToChat>('UserUploadedPhotoToChat')
