import { DomainEvent } from '../../dependencies/DomainEvent.js'
import { UUID } from '../../domain/UUID.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'

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
