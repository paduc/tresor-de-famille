import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type SpouseAdded = BaseDomainEvent & {
  type: 'SpouseAdded'
  payload: {
    personId: string
    spouse: {
      id: string
      name: string
    }
  }
}

export const SpouseAdded = (payload: SpouseAdded['payload']): SpouseAdded =>
  makeDomainEvent({
    type: 'SpouseAdded',
    payload,
  })
