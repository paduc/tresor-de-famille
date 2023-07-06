import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingUserRecognizedPersonInFamilyPhoto = DomainEvent<
  'OnboardingUserRecognizedPersonInFamilyPhoto',
  {
    faceId: UUID
    photoId: UUID

    personId: UUID

    userId: UUID
  }
>

export const OnboardingUserRecognizedPersonInFamilyPhoto = makeDomainEvent<OnboardingUserRecognizedPersonInFamilyPhoto>(
  'OnboardingUserRecognizedPersonInFamilyPhoto'
)
