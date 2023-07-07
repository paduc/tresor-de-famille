import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'
import { FamilyMemberRelationship } from './FamilyMemberRelationship'

export type OnboardingUserConfirmedRelationUsingOpenAI = DomainEvent<
  'OnboardingUserConfirmedRelationUsingOpenAI',
  {
    personId: UUID

    relationship: FamilyMemberRelationship

    userId: UUID
  }
>

export const OnboardingUserConfirmedRelationUsingOpenAI = makeDomainEvent<OnboardingUserConfirmedRelationUsingOpenAI>(
  'OnboardingUserConfirmedRelationUsingOpenAI'
)
