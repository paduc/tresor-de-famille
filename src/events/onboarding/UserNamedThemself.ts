import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserNamedThemself = DomainEvent<
  'UserNamedThemself',
  {
    userId: AppUserId
    personId: PersonId // new person
    name: string

    familyId: FamilyId
  }
>

export const UserNamedThemself = makeDomainEvent<UserNamedThemself>('UserNamedThemself')
