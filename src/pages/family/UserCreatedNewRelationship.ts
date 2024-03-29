import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { RelationshipId } from '../../domain/RelationshipId.js'

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
    familyId: FamilyId
  }
>

export const UserCreatedNewRelationship = makeDomainEvent<UserCreatedNewRelationship>('UserCreatedNewRelationship')
