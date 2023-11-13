import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain'
import { ThreadId } from '../../domain/ThreadId'

export type OnboardingUserStartedFirstThread = DomainEvent<
  'OnboardingUserStartedFirstThread',
  {
    message: string
    threadId: ThreadId
    userId: UUID
  }
>

export const OnboardingUserStartedFirstThread = makeDomainEvent<OnboardingUserStartedFirstThread>(
  'OnboardingUserStartedFirstThread'
)
