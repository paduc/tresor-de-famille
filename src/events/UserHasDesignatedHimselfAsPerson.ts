import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserHasDesignatedHimselfAsPerson = BaseDomainEvent & {
  type: 'UserHasDesignatedHimselfAsPerson'
  payload: {
    userId: string
    personId: string
  }
}

export const UserHasDesignatedHimselfAsPerson = (
  payload: UserHasDesignatedHimselfAsPerson['payload']
): UserHasDesignatedHimselfAsPerson =>
  makeDomainEvent({
    type: 'UserHasDesignatedHimselfAsPerson',
    payload,
  })
