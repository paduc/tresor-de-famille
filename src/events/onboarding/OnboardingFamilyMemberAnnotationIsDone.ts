import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'

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
