import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserSetFamilyTreeOrigin = DomainEvent<
  'UserSetFamilyTreeOrigin',
  {
    newPerson: {
      personId: PersonId
      name: string
    }
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserSetFamilyTreeOrigin = makeDomainEvent<UserSetFamilyTreeOrigin>('UserSetFamilyTreeOrigin')
