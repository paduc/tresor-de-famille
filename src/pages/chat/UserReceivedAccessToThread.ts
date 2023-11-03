import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type UserReceivedAccessToThread = DomainEvent<
  'UserReceivedAccessToThread',
  {
    chatId: UUID
    userId: UUID
    code: string
  }
>

export const UserReceivedAccessToThread = makeDomainEvent<UserReceivedAccessToThread>('UserReceivedAccessToThread')
