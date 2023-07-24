import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'

export type UserSentMessageToChat = DomainEvent<
  'UserSentMessageToChat',
  {
    chatId: UUID
    message: string
    messageId: UUID
    userId: UUID
  }
>

export const UserSentMessageToChat = makeDomainEvent<UserSentMessageToChat>('UserSentMessageToChat')
