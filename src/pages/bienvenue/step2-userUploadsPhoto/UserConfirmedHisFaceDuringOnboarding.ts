import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type UserConfirmedHisFaceDuringOnboarding = DomainEvent<
  'UserConfirmedHisFaceDuringOnboarding',
  {
    userId: UUID
    faceId: UUID
    photoId: UUID
    personId: UUID
  }
>

export const UserConfirmedHisFaceDuringOnboarding = makeDomainEvent<UserConfirmedHisFaceDuringOnboarding>(
  'UserConfirmedHisFaceDuringOnboarding'
)
