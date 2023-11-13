import { UUID } from '../domain'
import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'
import { PersonId } from '../domain/PersonId'

type Relationship = {
  parentId: PersonId
  childId: PersonId
}

type Person = {
  id: PersonId
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
