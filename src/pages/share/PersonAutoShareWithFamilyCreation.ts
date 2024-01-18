import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'

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
