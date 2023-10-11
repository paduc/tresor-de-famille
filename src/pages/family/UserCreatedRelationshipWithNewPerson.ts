import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

type Relationship =
  | {
      type: 'parent'
      parentId: UUID
      childId: UUID
    }
  | {
      type: 'spouses'
      spouseIds: [UUID, UUID]
    }
  | {
      type: 'friends'
      friendIds: [UUID, UUID]
    }

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
