import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type UserRemovedRelationship = DomainEvent<
  'UserRemovedRelationship',
  {
    relationshipId: UUID
    userId: UUID
  }
>

export const UserRemovedRelationship = makeDomainEvent<UserRemovedRelationship>('UserRemovedRelationship')
