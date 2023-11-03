import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type UserEnabledSharingOfThread = DomainEvent<
  'UserEnabledSharingOfThread',
  {
    chatId: UUID
    userId: UUID
    code: string
  }
>

export const UserEnabledSharingOfThread = makeDomainEvent<UserEnabledSharingOfThread>('UserEnabledSharingOfThread')
