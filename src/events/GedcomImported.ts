import { UUID } from '../domain'
import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

type Relationship = {
  parentId: UUID
  childId: UUID
}

type Person = {
  id: UUID
  name: string
  bornOn?: string
  bornIn?: string
  passedOn?: string
  passedIn?: string
  sex?: 'M' | 'F'
}

export type GedcomImported = BaseDomainEvent & {
  type: 'GedcomImported'
  payload: {
    rawGedcom: string
    relationships: Relationship[]
    persons: Person[]
    importedBy: UUID
  }
}

export const GedcomImported = (payload: GedcomImported['payload']): GedcomImported =>
  makeDomainEvent({
    type: 'GedcomImported',
    payload,
  })
