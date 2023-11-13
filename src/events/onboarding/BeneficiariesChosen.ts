import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'

export type BeneficiariesChosen = DomainEvent<
  'BeneficiariesChosen',
  { userId: AppUserId } & (
    | {
        mode: 'tdf-detection-contacts-beneficiaries' // 'automatic'
        beneficiaries: ({ name: string } & ({ email: string } | { address: string }))[]
      }
    | {
        mode: 'user-distributes-codes' // 'manual'
      }
  )
>

export const BeneficiariesChosen = makeDomainEvent<BeneficiariesChosen>('BeneficiariesChosen')
