import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type OnboardingUserUploadedPhotoOfThemself = DomainEvent<
  'OnboardingUserUploadedPhotoOfThemself',
  {
    photoId: UUID
    location:
      | {
          type: 'S3'
          bucket: string
          endpoint: string
          key: string
        }
      | { type: 'localfile' }
    uploadedBy: UUID
  }
>

export const OnboardingUserUploadedPhotoOfThemself = makeDomainEvent<OnboardingUserUploadedPhotoOfThemself>(
  'OnboardingUserUploadedPhotoOfThemself'
)
