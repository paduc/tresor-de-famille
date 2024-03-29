import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export type OnboardingUserStartedFirstThread = DomainEvent<
  'OnboardingUserStartedFirstThread',
  {
    message: string
    threadId: ThreadId
    userId: AppUserId
    familyId: FamilyId
  }
>

export const OnboardingUserStartedFirstThread = makeDomainEvent<OnboardingUserStartedFirstThread>(
  'OnboardingUserStartedFirstThread'
)
