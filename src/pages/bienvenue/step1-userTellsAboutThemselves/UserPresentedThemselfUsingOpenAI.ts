import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type UserPresentedThemselfUsingOpenAI = DomainEvent<
  'UserPresentedThemselfUsingOpenAI',
  {
    userId: UUID
    personId: UUID // new person
    name: string
    messages: {
      role: 'assistant' | 'user' | 'system'
      content: string | null
      function_call?: { name: string; arguments: string }
    }[]
  }
>

export const UserPresentedThemselfUsingOpenAI = makeDomainEvent<UserPresentedThemselfUsingOpenAI>(
  'UserPresentedThemselfUsingOpenAI'
)
