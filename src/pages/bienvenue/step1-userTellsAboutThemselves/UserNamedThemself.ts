import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type UserNamedThemself = DomainEvent<
  'UserNamedThemself',
  {
    userId: UUID
    personId: UUID // new person
    name: string
  }
>

export const UserNamedThemself = makeDomainEvent<UserNamedThemself>('UserNamedThemself')
