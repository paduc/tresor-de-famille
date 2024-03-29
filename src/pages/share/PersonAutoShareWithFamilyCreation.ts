import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type PersonAutoShareWithFamilyCreation = DomainEvent<
  'PersonAutoShareWithFamilyCreation',
  {
    familyId: FamilyId
    personId: PersonId
  }
>

export const PersonAutoShareWithFamilyCreation = makeDomainEvent<PersonAutoShareWithFamilyCreation>(
  'PersonAutoShareWithFamilyCreation'
)
