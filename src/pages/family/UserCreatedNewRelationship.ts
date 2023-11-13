import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'
import { RelationshipId } from '../../domain/RelationshipId'

export type Relationship = { id: RelationshipId } & (
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
    userId: AppUserId
  }
>

export const UserCreatedNewRelationship = makeDomainEvent<UserCreatedNewRelationship>('UserCreatedNewRelationship')
