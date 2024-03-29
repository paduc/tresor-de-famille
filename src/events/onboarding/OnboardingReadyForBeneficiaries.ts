import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'

export type OnboardingReadyForBeneficiaries = DomainEvent<
  'OnboardingReadyForBeneficiaries',
  {
    userId: AppUserId
    familyId: FamilyId
  }
>

export const OnboardingReadyForBeneficiaries = makeDomainEvent<OnboardingReadyForBeneficiaries>(
  'OnboardingReadyForBeneficiaries'
)
