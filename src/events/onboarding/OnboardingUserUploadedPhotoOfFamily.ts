import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'

export type OnboardingUserUploadedPhotoOfFamily = DomainEvent<
  'OnboardingUserUploadedPhotoOfFamily',
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

export const OnboardingUserUploadedPhotoOfFamily = makeDomainEvent<OnboardingUserUploadedPhotoOfFamily>(
  'OnboardingUserUploadedPhotoOfFamily'
)
