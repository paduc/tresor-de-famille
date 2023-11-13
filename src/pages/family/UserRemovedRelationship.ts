import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { RelationshipId } from '../../domain/RelationshipId'

export type UserRemovedRelationship = DomainEvent<
  'UserRemovedRelationship',
  {
    relationshipId: RelationshipId
    userId: AppUserId
  }
>

export const UserRemovedRelationship = makeDomainEvent<UserRemovedRelationship>('UserRemovedRelationship')
