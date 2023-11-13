import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { PersonId } from '../../domain/PersonId'

export type UserIgnoredRelationship = DomainEvent<
  'UserIgnoredRelationship',
  {
    personId: PersonId

    userId: UUID
  }
>

export const UserIgnoredRelationship = makeDomainEvent<UserIgnoredRelationship>('UserIgnoredRelationship')
