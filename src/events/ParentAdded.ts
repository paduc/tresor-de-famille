import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type ParentAdded = BaseDomainEvent & {
  type: 'ParentAdded'
  payload: {
    personId: string
    parent: {
      id: string
      name: string
    }
  }
}

export const ParentAdded = (payload: ParentAdded['payload']): ParentAdded =>
  makeDomainEvent({
    type: 'ParentAdded',
    payload,
  })
