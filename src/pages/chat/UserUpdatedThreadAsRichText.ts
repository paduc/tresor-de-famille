import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { TipTapContentAsJSON } from './TipTapTypes'

export type UserUpdatedThreadAsRichText = DomainEvent<
  'UserUpdatedThreadAsRichText',
  {
    chatId: UUID
    contentAsJSON: TipTapContentAsJSON
    userId: UUID
  }
>

export const UserUpdatedThreadAsRichText = makeDomainEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText')
