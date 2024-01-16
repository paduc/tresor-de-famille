import { DomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadId } from '../../domain/ThreadId'

/**
 * This is a deprecated event, in that it is not emitted anymore
 * Events still exist in the history
 */
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

export const UserSentMessageToChat = undefined
