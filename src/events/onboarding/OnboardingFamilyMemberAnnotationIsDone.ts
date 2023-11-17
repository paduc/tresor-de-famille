import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'

export type OnboardingFamilyMemberAnnotationIsDone = DomainEvent<
  'OnboardingFamilyMemberAnnotationIsDone',
  {
    userId: AppUserId

    familyId: FamilyId
  }
>

export const OnboardingFamilyMemberAnnotationIsDone = makeDomainEvent<OnboardingFamilyMemberAnnotationIsDone>(
  'OnboardingFamilyMemberAnnotationIsDone'
)
