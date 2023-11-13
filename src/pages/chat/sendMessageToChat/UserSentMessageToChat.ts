import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { ThreadId } from '../../../domain/ThreadId'
import { AppUserId } from '../../../domain/AppUserId'

export type UserSentMessageToChat = DomainEvent<
  'UserSentMessageToChat',
  {
    chatId: ThreadId
    message: string
    messageId: UUID
    userId: AppUserId
  }
>

export const UserSentMessageToChat = makeDomainEvent<UserSentMessageToChat>('UserSentMessageToChat')
