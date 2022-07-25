import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent';


type Relationship = {
  parentId: string
  childId: string
}

type Person = {
  id: string
  name: string
}

export type gedcomImport = BaseDomainEvent & {
  type: 'gedcomImport'
  payload: {
    rawGedcom: string
    relationships: Relationship[]
    persons: Person[]
  }
}

export const gedcomImport = (
  payload: gedcomImport['payload']
): gedcomImport =>
  makeDomainEvent({
    type: 'gedcomImport',
    payload,
  })
