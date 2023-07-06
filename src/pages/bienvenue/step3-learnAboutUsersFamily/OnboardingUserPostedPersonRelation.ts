import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingUserPostedPersonRelation = DomainEvent<
  'OnboardingUserPostedPersonRelation',
  {
    faceId: UUID
    photoId: UUID
    personId: UUID

    messages: {
      role: 'assistant' | 'user' | 'system'
      content: string | null
      function_call?: { name: string; arguments: string }
    }[]

    userId: UUID
  }
>

export const OnboardingUserPostedPersonRelation = makeDomainEvent<OnboardingUserPostedPersonRelation>(
  'OnboardingUserPostedPersonRelation'
)
