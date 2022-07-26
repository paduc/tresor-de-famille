import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

type Relationship = {
  parentId: string
  childId: string
}

type Person = {
  id: string
  name: string
  bornOn: string
  bornIn: string
  passedOn: string
  passedIn: string
  sex: string
}

export type GedcomImported = BaseDomainEvent & {
  type: 'GedcomImported'
  payload: {
    rawGedcom: string
    relationships: Relationship[]
    persons: Person[]
  }
}

export const GedcomImported = (payload: GedcomImported['payload']): GedcomImported =>
  makeDomainEvent({
    type: 'GedcomImported',
    payload,
  })
