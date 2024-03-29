import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserChangedPersonName = DomainEvent<
  'UserChangedPersonName',
  {
    personId: PersonId
    name: string
    userId: AppUserId
  }
>

export const UserChangedPersonName = makeDomainEvent<UserChangedPersonName>('UserChangedPersonName')
