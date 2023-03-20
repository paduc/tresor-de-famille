import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type UserAddedCaptionToPhoto = BaseDomainEvent & {
  type: 'UserAddedCaptionToPhoto'
  payload: {
    chatId: UUID
    photoId: UUID
    caption: {
      id: UUID
      body: string
    }
    addedBy: UUID
  }
}

export const UserAddedCaptionToPhoto = (payload: UserAddedCaptionToPhoto['payload']): UserAddedCaptionToPhoto =>
  makeDomainEvent({
    type: 'UserAddedCaptionToPhoto',
    payload,
  })
