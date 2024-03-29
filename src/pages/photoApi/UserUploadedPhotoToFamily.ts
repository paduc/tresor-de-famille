import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { EXIF } from '../../libs/exif.js'

export type FileStorageLocation =
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
    location: FileStorageLocation
    userId: AppUserId
    familyId: FamilyId
    exif?: EXIF
  }
>

export const UserUploadedPhotoToFamily = makeDomainEvent<UserUploadedPhotoToFamily>('UserUploadedPhotoToFamily')
