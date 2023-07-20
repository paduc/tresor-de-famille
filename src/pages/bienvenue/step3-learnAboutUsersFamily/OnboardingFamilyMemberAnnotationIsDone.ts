import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain'

export type OnboardingFamilyMemberAnnotationIsDone = DomainEvent<
  'OnboardingFamilyMemberAnnotationIsDone',
  {
    userId: UUID
  }
>

export const OnboardingFamilyMemberAnnotationIsDone = makeDomainEvent<OnboardingFamilyMemberAnnotationIsDone>(
  'OnboardingFamilyMemberAnnotationIsDone'
)
