import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'

export type UserSetPhotoLocation = DomainEvent<
  'UserSetPhotoLocation',
  {
    photoId: PhotoId
    userId: AppUserId
  } & (
    | {
        isIrrelevant: false
        gpsOption: 'exif' | 'none'
        name:
          | {
              option: 'user'
              locationName: string
            }
          | { option: 'mapboxFromExif' }
      }
    | { isIrrelevant: true }
  )
>

export const UserSetPhotoLocation = makeDomainEvent<UserSetPhotoLocation>('UserSetPhotoLocation')
