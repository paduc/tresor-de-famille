import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type UserChangedPersonName = DomainEvent<
  'UserChangedPersonName',
  {
    personId: UUID
    name: string
    userId: UUID
  }
>

export const UserChangedPersonName = makeDomainEvent<UserChangedPersonName>('UserChangedPersonName')
