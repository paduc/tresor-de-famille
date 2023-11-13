import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { Relationship } from './UserCreatedNewRelationship'
import { PersonId } from '../../domain/PersonId'

export type UserCreatedRelationshipWithNewPerson = DomainEvent<
  'UserCreatedRelationshipWithNewPerson',
  {
    relationship: Relationship
    newPerson: {
      personId: PersonId
      name: string
    }
    userId: UUID
  }
>

export const UserCreatedRelationshipWithNewPerson = makeDomainEvent<UserCreatedRelationshipWithNewPerson>(
  'UserCreatedRelationshipWithNewPerson'
)
