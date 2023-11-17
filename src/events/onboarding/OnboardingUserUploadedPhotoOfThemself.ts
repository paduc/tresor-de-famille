import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'

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
    uploadedBy: AppUserId
    familyId: FamilyId
  }
>

export const OnboardingUserUploadedPhotoOfThemself = makeDomainEvent<OnboardingUserUploadedPhotoOfThemself>(
  'OnboardingUserUploadedPhotoOfThemself'
)
