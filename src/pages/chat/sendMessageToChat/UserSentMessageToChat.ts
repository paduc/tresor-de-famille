import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/addToHistory'

export type UserSentMessageToChat = DomainEvent<
  'UserSentMessageToChat',
  {
    chatId: UUID
    message: string
    messageId: UUID
    sentBy: UUID
  }
>

export const UserSentMessageToChat = makeDomainEvent<UserSentMessageToChat>('UserSentMessageToChat')
