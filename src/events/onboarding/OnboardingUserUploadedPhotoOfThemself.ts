import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type OnboardingUserUploadedPhotoOfThemself = DomainEvent<
  'OnboardingUserUploadedPhotoOfThemself',
  {
    photoId: PhotoId
    location:
      | {
          type: 'S3'
          bucket: string
          endpoint: string
          key: string
        }
      | { type: 'localfile' }
    userId: AppUserId
    familyId: FamilyId
  }
>

export const OnboardingUserUploadedPhotoOfThemself = makeDomainEvent<OnboardingUserUploadedPhotoOfThemself>(
  'OnboardingUserUploadedPhotoOfThemself'
)
