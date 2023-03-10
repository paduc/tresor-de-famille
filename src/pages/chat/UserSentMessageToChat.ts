import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type UserSentMessageToChat = BaseDomainEvent & {
  type: 'UserSentMessageToChat'
  payload: {
    chatId: UUID
    message: string
    messageId: UUID
    sentBy: UUID
  }
}

export const UserSentMessageToChat = (payload: UserSentMessageToChat['payload']): UserSentMessageToChat =>
  makeDomainEvent({
    type: 'UserSentMessageToChat',
    payload,
  })
