import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'
import { FamilyMemberRelationship } from './FamilyMemberRelationship'

export type OnboardingUserPostedRelationUsingOpenAI = DomainEvent<
  'OnboardingUserPostedRelationUsingOpenAI',
  {
    personId: UUID
    userAnswer: string

    messages: {
      role: 'assistant' | 'user' | 'system'
      content: string | null
      function_call?: { name: string; arguments: string }
    }[]

    relationship: FamilyMemberRelationship

    userId: UUID
  }
>

export const OnboardingUserPostedRelationUsingOpenAI = makeDomainEvent<OnboardingUserPostedRelationUsingOpenAI>(
  'OnboardingUserPostedRelationUsingOpenAI'
)
