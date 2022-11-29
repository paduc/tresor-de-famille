import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserHasDesignatedThemselfAsPerson = BaseDomainEvent & {
  type: 'UserHasDesignatedThemselfAsPerson'
  payload: {
    userId: string
    personId: string
  }
}

export const UserHasDesignatedThemselfAsPerson = (
  payload: UserHasDesignatedThemselfAsPerson['payload']
): UserHasDesignatedThemselfAsPerson =>
  makeDomainEvent({
    type: 'UserHasDesignatedThemselfAsPerson',
    payload,
  })
