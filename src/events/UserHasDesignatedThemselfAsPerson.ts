import { UUID } from '../domain'
import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserHasDesignatedThemselfAsPerson = BaseDomainEvent & {
  type: 'UserHasDesignatedThemselfAsPerson'
  payload: {
    userId: UUID
    personId: UUID
  }
}

export const UserHasDesignatedThemselfAsPerson = (
  payload: UserHasDesignatedThemselfAsPerson['payload']
): UserHasDesignatedThemselfAsPerson =>
  makeDomainEvent({
    type: 'UserHasDesignatedThemselfAsPerson',
    payload,
  })
