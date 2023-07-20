import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingBeneficiariesChosen = DomainEvent<
  'OnboardingBeneficiariesChosen',
  { userId: UUID } & (
    | {
        mode: 'tdf-detection-contacts-beneficiaries' // 'automatic'
        beneficiaries: ({ name: string } & ({ email: string } | { address: string }))[]
      }
    | {
        mode: 'user-distributes-codes' // 'manual'
      }
  )
>

export const OnboardingBeneficiariesChosen = makeDomainEvent<OnboardingBeneficiariesChosen>('OnboardingBeneficiariesChosen')
