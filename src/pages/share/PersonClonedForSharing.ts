import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'

export type PersonClonedForSharing = DomainEvent<
  'PersonClonedForSharing',
  {
    userId: AppUserId
    familyId: FamilyId
    personId: PersonId
    name: string
    clonedFrom: {
      familyId: FamilyId
      personId: PersonId
    }
  }
>

export const PersonClonedForSharing = makeDomainEvent<PersonClonedForSharing>('PersonClonedForSharing')
