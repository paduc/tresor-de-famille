import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'

export type UserRemovedRelationship = DomainEvent<
  'UserRemovedRelationship',
  {
    relationshipId: UUID
    userId: AppUserId
  }
>

export const UserRemovedRelationship = makeDomainEvent<UserRemovedRelationship>('UserRemovedRelationship')
