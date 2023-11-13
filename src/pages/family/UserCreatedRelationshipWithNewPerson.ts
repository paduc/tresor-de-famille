import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'
import { Relationship } from './UserCreatedNewRelationship'

export type UserCreatedRelationshipWithNewPerson = DomainEvent<
  'UserCreatedRelationshipWithNewPerson',
  {
    relationship: Relationship
    newPerson: {
      personId: PersonId
      name: string
    }
    userId: AppUserId
  }
>

export const UserCreatedRelationshipWithNewPerson = makeDomainEvent<UserCreatedRelationshipWithNewPerson>(
  'UserCreatedRelationshipWithNewPerson'
)
