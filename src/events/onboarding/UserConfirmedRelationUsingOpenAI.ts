import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyMemberRelationship } from '../../domain/FamilyMemberRelationship'
import { PersonId } from '../../domain/PersonId'

export type UserConfirmedRelationUsingOpenAI = DomainEvent<
  'UserConfirmedRelationUsingOpenAI',
  {
    personId: PersonId

    relationship: FamilyMemberRelationship

    userId: AppUserId
  }
>

export const UserConfirmedRelationUsingOpenAI = makeDomainEvent<UserConfirmedRelationUsingOpenAI>(
  'UserConfirmedRelationUsingOpenAI'
)
