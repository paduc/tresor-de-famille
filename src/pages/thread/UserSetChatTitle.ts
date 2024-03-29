import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export type UserSetChatTitle = DomainEvent<
  'UserSetChatTitle',
  {
    threadId: ThreadId
    title: string
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserSetChatTitle = makeDomainEvent<UserSetChatTitle>('UserSetChatTitle')
