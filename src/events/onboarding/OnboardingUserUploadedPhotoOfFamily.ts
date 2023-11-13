import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
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
    uploadedBy: AppUserId
  }
>

export const OnboardingUserUploadedPhotoOfFamily = makeDomainEvent<OnboardingUserUploadedPhotoOfFamily>(
  'OnboardingUserUploadedPhotoOfFamily'
)
