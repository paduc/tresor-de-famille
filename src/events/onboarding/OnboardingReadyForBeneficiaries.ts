import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type OnboardingReadyForBeneficiaries = DomainEvent<
  'OnboardingReadyForBeneficiaries',
  {
    userId: UUID
  }
>

export const OnboardingReadyForBeneficiaries = makeDomainEvent<OnboardingReadyForBeneficiaries>(
  'OnboardingReadyForBeneficiaries'
)
