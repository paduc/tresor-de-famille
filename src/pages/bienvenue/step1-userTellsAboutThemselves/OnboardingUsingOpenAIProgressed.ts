import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type OnboardingUsingOpenAIProgressed = DomainEvent<
  'OnboardingUsingOpenAIProgressed',
  {
    userId: UUID
    messages: {
      role: 'assistant' | 'user' | 'system'
      content: string | null
      function_call?: { name: string; arguments: string }
    }[]
  }
>

export const OnboardingUsingOpenAIProgressed = makeDomainEvent<OnboardingUsingOpenAIProgressed>(
  'OnboardingUsingOpenAIProgressed'
)
