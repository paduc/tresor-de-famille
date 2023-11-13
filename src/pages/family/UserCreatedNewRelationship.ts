import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { PersonId } from '../../domain/PersonId'

export type Relationship = { id: UUID } & (
  | {
      type: 'parent'
      parentId: PersonId
      childId: PersonId
    }
  | {
      type: 'spouses'
      spouseIds: [PersonId, PersonId]
    }
  | {
      type: 'friends'
      friendIds: [PersonId, PersonId]
    }
)

export type UserCreatedNewRelationship = DomainEvent<
  'UserCreatedNewRelationship',
  {
    relationship: Relationship
    userId: UUID
  }
>

export const UserCreatedNewRelationship = makeDomainEvent<UserCreatedNewRelationship>('UserCreatedNewRelationship')
