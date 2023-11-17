import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { RelationshipId } from '../../domain/RelationshipId'

export type UserRemovedRelationship = DomainEvent<
  'UserRemovedRelationship',
  {
    relationshipId: RelationshipId
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserRemovedRelationship = makeDomainEvent<UserRemovedRelationship>('UserRemovedRelationship')
