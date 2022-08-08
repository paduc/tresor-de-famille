import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type ChildAdded = BaseDomainEvent & {
  type: 'ChildAdded'
  payload: {
    personId: string
    child: {
      id: string
      name: string
    }
  }
}

export const ChildAdded = (payload: ChildAdded['payload']): ChildAdded =>
  makeDomainEvent({
    type: 'ChildAdded',
    payload,
  })
