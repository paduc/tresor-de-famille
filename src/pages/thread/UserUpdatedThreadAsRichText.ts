import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'
import { TipTapContentAsJSON } from './TipTapTypes'

export type UserUpdatedThreadAsRichText = DomainEvent<
  'UserUpdatedThreadAsRichText',
  {
    chatId: ThreadId
    contentAsJSON: TipTapContentAsJSON
    userId: AppUserId
  }
>

export const UserUpdatedThreadAsRichText = makeDomainEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText')
