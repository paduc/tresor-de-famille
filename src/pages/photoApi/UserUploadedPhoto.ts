import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { EXIF } from '../../libs/exif.js'

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
