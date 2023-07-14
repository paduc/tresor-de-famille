import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingUserIgnoredRelationship = DomainEvent<
  'OnboardingUserIgnoredRelationship',
  {
    personId: UUID

    userId: UUID
  }
>

export const OnboardingUserIgnoredRelationship = makeDomainEvent<OnboardingUserIgnoredRelationship>(
  'OnboardingUserIgnoredRelationship'
)
