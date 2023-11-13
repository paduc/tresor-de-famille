import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { ThreadId } from '../../../domain/ThreadId'

export type UserSentMessageToChat = DomainEvent<
  'UserSentMessageToChat',
  {
    chatId: ThreadId
    message: string
    messageId: UUID
    userId: UUID
  }
>

export const UserSentMessageToChat = makeDomainEvent<UserSentMessageToChat>('UserSentMessageToChat')
