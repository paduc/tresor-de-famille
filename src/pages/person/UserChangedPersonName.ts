import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { PersonId } from '../../domain/PersonId'

export type UserChangedPersonName = DomainEvent<
  'UserChangedPersonName',
  {
    personId: PersonId
    name: string
    userId: UUID
  }
>

export const UserChangedPersonName = makeDomainEvent<UserChangedPersonName>('UserChangedPersonName')
