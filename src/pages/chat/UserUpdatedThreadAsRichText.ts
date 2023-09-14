import { DomainEvent, makeDomainEvent, JSON } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

type TipTapJSON = { type: string; text?: string; content?: TipTapJSON[]; attrs?: { [Key: string]: string | number } }

export type TipTapContentAsJSON = {
  type: 'doc'
  content: TipTapJSON[]
}

export type UserUpdatedThreadAsRichText = DomainEvent<
  'UserUpdatedThreadAsRichText',
  {
    chatId: UUID
    contentAsJSON: TipTapContentAsJSON
    userId: UUID
  }
>

export const UserUpdatedThreadAsRichText = makeDomainEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText')
