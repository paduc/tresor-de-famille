import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { PersonId } from '../../domain/PersonId'
import { UUID } from '../../domain/UUID'

export type UserNamedThemself = DomainEvent<
  'UserNamedThemself',
  {
    userId: UUID
    personId: PersonId // new person
    name: string
  }
>

export const UserNamedThemself = makeDomainEvent<UserNamedThemself>('UserNamedThemself')
