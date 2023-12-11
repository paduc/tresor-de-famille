import { UUID } from '../../../domain'
import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { ThreadId } from '../../../domain/ThreadId'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'

export type UserSentMessageToChat = DomainEvent<
  'UserSentMessageToChat',
  {
    threadId: ThreadId
    message: string
    messageId: UUID
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserSentMessageToChat = makeDomainEvent<UserSentMessageToChat>('UserSentMessageToChat')
