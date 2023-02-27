import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type UserUploadedPhotoToChat = BaseDomainEvent & {
  type: 'UserUploadedPhotoToChat'
  payload: {
    chatId: UUID
    photoId: UUID
    uploadedBy: UUID
  }
}

export const UserUploadedPhotoToChat = (payload: UserUploadedPhotoToChat['payload']): UserUploadedPhotoToChat =>
  makeDomainEvent({
    type: 'UserUploadedPhotoToChat',
    payload,
  })
