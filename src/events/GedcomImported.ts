import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'
import { AppUserId } from '../domain/AppUserId'
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
    importedBy: AppUserId
  }
>

export const GedcomImported = makeDomainEvent<GedcomImported>('GedcomImported')
