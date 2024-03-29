import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'

export type UserIgnoredRelationship = DomainEvent<
  'UserIgnoredRelationship',
  {
    personId: PersonId

    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserIgnoredRelationship = makeDomainEvent<UserIgnoredRelationship>('UserIgnoredRelationship')
