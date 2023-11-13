import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'

export type UserChangedPersonName = DomainEvent<
  'UserChangedPersonName',
  {
    personId: PersonId
    name: string
    userId: AppUserId
    familyId?: FamilyId
  }
>

export const UserChangedPersonName = makeDomainEvent<UserChangedPersonName>('UserChangedPersonName')
