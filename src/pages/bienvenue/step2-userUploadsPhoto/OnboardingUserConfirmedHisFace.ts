import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type OnboardingUserConfirmedHisFace = DomainEvent<
  'OnboardingUserConfirmedHisFace',
  {
    userId: UUID
    faceId: UUID
    photoId: UUID
    personId: UUID
  }
>

export const OnboardingUserConfirmedHisFace = makeDomainEvent<OnboardingUserConfirmedHisFace>('OnboardingUserConfirmedHisFace')
