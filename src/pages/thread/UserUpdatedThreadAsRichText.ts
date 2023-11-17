import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { ThreadId } from '../../domain/ThreadId'
import { TipTapContentAsJSON } from './TipTapTypes'

export type UserUpdatedThreadAsRichText = DomainEvent<
  'UserUpdatedThreadAsRichText',
  {
    chatId: ThreadId
    contentAsJSON: TipTapContentAsJSON
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserUpdatedThreadAsRichText = makeDomainEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText')
