import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { FamilyMemberRelationship } from '../../domain/FamilyMemberRelationship'

export type UserConfirmedRelationUsingOpenAI = DomainEvent<
  'UserConfirmedRelationUsingOpenAI',
  {
    personId: UUID

    relationship: FamilyMemberRelationship

    userId: UUID
  }
>

export const UserConfirmedRelationUsingOpenAI = makeDomainEvent<UserConfirmedRelationUsingOpenAI>(
  'UserConfirmedRelationUsingOpenAI'
)
