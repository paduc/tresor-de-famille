import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type UserSetChatTitle = DomainEvent<
  'UserSetChatTitle',
  {
    chatId: UUID
    title: string
    userId: UUID
  }
>

export const UserSetChatTitle = makeDomainEvent<UserSetChatTitle>('UserSetChatTitle')
