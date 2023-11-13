import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'

export type UserIgnoredRelationship = DomainEvent<
  'UserIgnoredRelationship',
  {
    personId: PersonId

    userId: AppUserId
    familyId?: FamilyId
  }
>

export const UserIgnoredRelationship = makeDomainEvent<UserIgnoredRelationship>('UserIgnoredRelationship')
