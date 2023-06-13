import { UUID } from '../domain'
import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'

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

export type GedcomImported = DomainEvent<
  'GedcomImported',
  {
    rawGedcom: string
    relationships: Relationship[]
    persons: Person[]
    importedBy: UUID
  }
>

export const GedcomImported = makeDomainEvent<GedcomImported>('GedcomImported')
