import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'

export type OnboardingReadyForBeneficiaries = DomainEvent<
  'OnboardingReadyForBeneficiaries',
  {
    userId: AppUserId
  }
>

export const OnboardingReadyForBeneficiaries = makeDomainEvent<OnboardingReadyForBeneficiaries>(
  'OnboardingReadyForBeneficiaries'
)
