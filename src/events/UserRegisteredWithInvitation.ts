import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { FamilyId } from '../domain/FamilyId.js'
import { FamilyShareCode } from '../domain/FamilyShareCode.js'

/**
 * Is triggered when an _unregistered_ user accepts an invitation to a family
 * (UserAcceptedInvitation is NOT triggered)
 */
export type UserRegisteredWithInvitation = DomainEvent<
  'UserRegisteredWithInvitation',
  {
    userId: AppUserId
    email: string
    passwordHash: string
    shareCode: FamilyShareCode
    familyId: FamilyId
  }
>

export const UserRegisteredWithInvitation = makeDomainEvent<UserRegisteredWithInvitation>('UserRegisteredWithInvitation')
