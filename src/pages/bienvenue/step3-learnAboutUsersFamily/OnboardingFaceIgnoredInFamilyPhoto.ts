import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingFaceIgnoredInFamilyPhoto = DomainEvent<
  'OnboardingFaceIgnoredInFamilyPhoto',
  {
    faceId: UUID
    photoId: UUID

    ignoredBy: UUID
  }
>

export const OnboardingFaceIgnoredInFamilyPhoto = makeDomainEvent<OnboardingFaceIgnoredInFamilyPhoto>(
  'OnboardingFaceIgnoredInFamilyPhoto'
)
