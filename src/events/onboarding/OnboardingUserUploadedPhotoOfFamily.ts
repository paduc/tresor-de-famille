import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
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
    uploadedBy: UUID
  }
>

export const OnboardingUserUploadedPhotoOfFamily = makeDomainEvent<OnboardingUserUploadedPhotoOfFamily>(
  'OnboardingUserUploadedPhotoOfFamily'
)
