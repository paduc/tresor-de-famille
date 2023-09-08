import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'

export type OnboardingUserStartedFirstThread = DomainEvent<
  'OnboardingUserStartedFirstThread',
  {
    message: string
    threadId: UUID
    userId: UUID
  }
>

export const OnboardingUserStartedFirstThread = makeDomainEvent<OnboardingUserStartedFirstThread>(
  'OnboardingUserStartedFirstThread'
)
