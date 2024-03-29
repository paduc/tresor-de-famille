import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'

/**
 * Is triggered when a _registered_ user accepts an invitation to a family
 */
export type UserAcceptedInvitation = DomainEvent<
  'UserAcceptedInvitation',
  {
    userId: AppUserId
    familyId: FamilyId
    shareCode: FamilyShareCode
  }
>

export const UserAcceptedInvitation = makeDomainEvent<UserAcceptedInvitation>('UserAcceptedInvitation')
