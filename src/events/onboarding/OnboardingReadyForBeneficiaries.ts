import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export type OnboardingReadyForBeneficiaries = DomainEvent<
  'OnboardingReadyForBeneficiaries',
  {
    userId: AppUserId
    familyId?: FamilyId
  }
>

export const OnboardingReadyForBeneficiaries = makeDomainEvent<OnboardingReadyForBeneficiaries>(
  'OnboardingReadyForBeneficiaries'
)
