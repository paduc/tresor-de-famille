import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingUserNamedPersonInFamilyPhoto = DomainEvent<
  'OnboardingUserNamedPersonInFamilyPhoto',
  {
    faceId: UUID
    photoId: UUID

    personId: UUID
    name: string

    userId: UUID
  }
>

export const OnboardingUserNamedPersonInFamilyPhoto = makeDomainEvent<OnboardingUserNamedPersonInFamilyPhoto>(
  'OnboardingUserNamedPersonInFamilyPhoto'
)
