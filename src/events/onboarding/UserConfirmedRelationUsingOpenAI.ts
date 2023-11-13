import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FamilyMemberRelationship } from '../../domain/FamilyMemberRelationship'
import { PersonId } from '../../domain/PersonId'

export type UserConfirmedRelationUsingOpenAI = DomainEvent<
  'UserConfirmedRelationUsingOpenAI',
  {
    personId: PersonId

    relationship: FamilyMemberRelationship

    userId: UUID
  }
>

export const UserConfirmedRelationUsingOpenAI = makeDomainEvent<UserConfirmedRelationUsingOpenAI>(
  'UserConfirmedRelationUsingOpenAI'
)
