import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'

export type OnboardingFamilyMemberAnnotationIsDone = DomainEvent<
  'OnboardingFamilyMemberAnnotationIsDone',
  {
    userId: AppUserId
  }
>

export const OnboardingFamilyMemberAnnotationIsDone = makeDomainEvent<OnboardingFamilyMemberAnnotationIsDone>(
  'OnboardingFamilyMemberAnnotationIsDone'
)
