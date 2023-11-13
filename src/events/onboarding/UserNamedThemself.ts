import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'

export type UserNamedThemself = DomainEvent<
  'UserNamedThemself',
  {
    userId: AppUserId
    personId: PersonId // new person
    name: string
  }
>

export const UserNamedThemself = makeDomainEvent<UserNamedThemself>('UserNamedThemself')
