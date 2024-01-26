import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'
import { EXIF } from '../../libs/exif'

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
    exif?: EXIF
  }
>

export const UserUploadedPhoto = makeDomainEvent<UserUploadedPhoto>('UserUploadedPhoto')
