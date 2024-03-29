import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'

export type UserCreatedNewFamily = DomainEvent<
  'UserCreatedNewFamily',
  {
    familyName: string
    about: string
    userId: AppUserId
    familyId: FamilyId
    shareCode: FamilyShareCode
  }
>

export const UserCreatedNewFamily = makeDomainEvent<UserCreatedNewFamily>('UserCreatedNewFamily')
