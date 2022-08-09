import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'
import { Person } from '../types/Person'

type Relationship = {
  parentId: string
  childId: string
}

type PersonDetailed = Person & {
  bornOn?: string
  bornIn?: string
  passedOn?: string
  passedIn?: string
  sex?: string
  profilePictureId?: string | null
  picturedIn?: string
}

export type GedcomImported = BaseDomainEvent & {
  type: 'GedcomImported'
  payload: {
    rawGedcom: string
    relationships: Relationship[]
    persons: PersonDetailed[]
    importedBy: string
  }
}

export const GedcomImported = (payload: GedcomImported['payload']): GedcomImported =>
  makeDomainEvent({
    type: 'GedcomImported',
    payload,
  })
