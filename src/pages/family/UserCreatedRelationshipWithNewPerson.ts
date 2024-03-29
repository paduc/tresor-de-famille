import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { Relationship } from './UserCreatedNewRelationship.js'

export type UserCreatedRelationshipWithNewPerson = DomainEvent<
  'UserCreatedRelationshipWithNewPerson',
  {
    relationship: Relationship
    newPerson: {
      personId: PersonId
      name: string
    }
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserCreatedRelationshipWithNewPerson = makeDomainEvent<UserCreatedRelationshipWithNewPerson>(
  'UserCreatedRelationshipWithNewPerson'
)
