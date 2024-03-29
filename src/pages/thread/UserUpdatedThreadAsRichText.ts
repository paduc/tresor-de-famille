import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { TipTapContentAsJSON } from './TipTapTypes.js'

export type UserUpdatedThreadAsRichText = DomainEvent<
  'UserUpdatedThreadAsRichText',
  {
    threadId: ThreadId
    contentAsJSON: TipTapContentAsJSON
    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserUpdatedThreadAsRichText = makeDomainEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText')
