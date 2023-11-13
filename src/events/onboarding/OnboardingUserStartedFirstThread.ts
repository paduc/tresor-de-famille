import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { ThreadId } from '../../domain/ThreadId'

export type OnboardingUserStartedFirstThread = DomainEvent<
  'OnboardingUserStartedFirstThread',
  {
    message: string
    threadId: ThreadId
    userId: AppUserId
  }
>

export const OnboardingUserStartedFirstThread = makeDomainEvent<OnboardingUserStartedFirstThread>(
  'OnboardingUserStartedFirstThread'
)
