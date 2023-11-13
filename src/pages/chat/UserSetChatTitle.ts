import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { ThreadId } from '../../domain/ThreadId'

export type UserSetChatTitle = DomainEvent<
  'UserSetChatTitle',
  {
    chatId: ThreadId
    title: string
    userId: UUID
  }
>

export const UserSetChatTitle = makeDomainEvent<UserSetChatTitle>('UserSetChatTitle')
