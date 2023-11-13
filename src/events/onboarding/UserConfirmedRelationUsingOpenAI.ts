import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyMemberRelationship } from '../../domain/FamilyMemberRelationship'
import { PersonId } from '../../domain/PersonId'

export type UserConfirmedRelationUsingOpenAI = DomainEvent<
  'UserConfirmedRelationUsingOpenAI',
  {
    personId: PersonId

    relationship: FamilyMemberRelationship

    userId: AppUserId

    familyId?: FamilyId
  }
>

export const UserConfirmedRelationUsingOpenAI = makeDomainEvent<UserConfirmedRelationUsingOpenAI>(
  'UserConfirmedRelationUsingOpenAI'
)
