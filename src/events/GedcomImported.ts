import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { FamilyId } from '../domain/FamilyId.js'
import { PersonId } from '../domain/PersonId.js'

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
    userId: AppUserId
    familyId: FamilyId
  }
>

export const GedcomImported = makeDomainEvent<GedcomImported>('GedcomImported')
