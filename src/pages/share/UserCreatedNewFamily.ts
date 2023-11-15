import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

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
