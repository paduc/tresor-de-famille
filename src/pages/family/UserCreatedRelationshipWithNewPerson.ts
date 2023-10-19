import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { Relationship } from './UserCreatedNewRelationship'

export type UserCreatedRelationshipWithNewPerson = DomainEvent<
  'UserCreatedRelationshipWithNewPerson',
  {
    relationship: Relationship
    newPerson: {
      personId: UUID
      name: string
    }
    userId: UUID
  }
>

export const UserCreatedRelationshipWithNewPerson = makeDomainEvent<UserCreatedRelationshipWithNewPerson>(
  'UserCreatedRelationshipWithNewPerson'
)
