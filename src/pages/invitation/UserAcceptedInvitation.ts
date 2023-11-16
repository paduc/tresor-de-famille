import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

export type UserAcceptedInvitation = DomainEvent<
  'UserAcceptedInvitation',
  {
    userId: AppUserId
    familyId: FamilyId
    shareCode: FamilyShareCode
  }
>

export const UserAcceptedInvitation = makeDomainEvent<UserAcceptedInvitation>('UserAcceptedInvitation')
