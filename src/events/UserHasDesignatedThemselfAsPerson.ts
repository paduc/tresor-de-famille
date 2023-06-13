import { UUID } from '../domain'
import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'

export type UserHasDesignatedThemselfAsPerson = DomainEvent<
  'UserHasDesignatedThemselfAsPerson',
  {
    userId: UUID
    personId: UUID
  }
>

export const UserHasDesignatedThemselfAsPerson = makeDomainEvent<UserHasDesignatedThemselfAsPerson>(
  'UserHasDesignatedThemselfAsPerson'
)
