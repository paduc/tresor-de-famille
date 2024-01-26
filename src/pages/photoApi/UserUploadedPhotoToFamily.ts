import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
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

export type UserUploadedPhotoToFamily = DomainEvent<
  'UserUploadedPhotoToFamily',
  {
    photoId: PhotoId
    location: PhotoLocation
    userId: AppUserId
    familyId: FamilyId
    exif?: EXIF
  }
>

export const UserUploadedPhotoToFamily = makeDomainEvent<UserUploadedPhotoToFamily>('UserUploadedPhotoToFamily')
