import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadId } from '../../domain/ThreadId'

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
