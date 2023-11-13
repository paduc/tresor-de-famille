import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'

export type UserSetChatTitle = DomainEvent<
  'UserSetChatTitle',
  {
    chatId: ThreadId
    title: string
    userId: AppUserId
  }
>

export const UserSetChatTitle = makeDomainEvent<UserSetChatTitle>('UserSetChatTitle')
