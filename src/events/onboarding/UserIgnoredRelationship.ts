import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type UserIgnoredRelationship = DomainEvent<
  'UserIgnoredRelationship',
  {
    personId: UUID

    userId: UUID
  }
>

export const UserIgnoredRelationship = makeDomainEvent<UserIgnoredRelationship>('UserIgnoredRelationship')
