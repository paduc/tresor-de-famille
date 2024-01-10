import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'

export type PhotoLocation =
  | {
      type: 'S3'
      bucket: string
      endpoint: string
      key: string
    }
  | { type: 'localfile' }

export type UserUploadedPhoto = DomainEvent<
  'UserUploadedPhoto',
  {
    photoId: PhotoId
    location: PhotoLocation
    userId: AppUserId
  }
>

export const UserUploadedPhoto = makeDomainEvent<UserUploadedPhoto>('UserUploadedPhoto')
