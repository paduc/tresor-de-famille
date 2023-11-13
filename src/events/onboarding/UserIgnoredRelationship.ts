import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PersonId } from '../../domain/PersonId'

export type UserIgnoredRelationship = DomainEvent<
  'UserIgnoredRelationship',
  {
    personId: PersonId

    userId: AppUserId
  }
>

export const UserIgnoredRelationship = makeDomainEvent<UserIgnoredRelationship>('UserIgnoredRelationship')
