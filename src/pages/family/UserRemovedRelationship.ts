import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { RelationshipId } from '../../domain/RelationshipId.js'

export type UserRemovedRelationship = DomainEvent<
  'UserRemovedRelationship',
  {
    relationshipId: RelationshipId
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserRemovedRelationship = makeDomainEvent<UserRemovedRelationship>('UserRemovedRelationship')
