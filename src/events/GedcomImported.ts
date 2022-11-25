import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type Relationship = {
  parentId: string
  childId: string
}

export type Person = {
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
    importedBy: string
  }
}

export const GedcomImported = (payload: GedcomImported['payload']): GedcomImported =>
  makeDomainEvent({
    type: 'GedcomImported',
    payload,
  })
