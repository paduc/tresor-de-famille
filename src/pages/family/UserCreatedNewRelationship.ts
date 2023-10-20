import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type Relationship = { id: UUID } & (
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
)

export type UserCreatedNewRelationship = DomainEvent<
  'UserCreatedNewRelationship',
  {
    relationship: Relationship
    userId: UUID
  }
>

export const UserCreatedNewRelationship = makeDomainEvent<UserCreatedNewRelationship>('UserCreatedNewRelationship')