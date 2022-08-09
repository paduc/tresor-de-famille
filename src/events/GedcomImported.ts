import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'
import { Person } from '../types/Person'

type Relationship = {
  parentId: string
  childId: string
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
