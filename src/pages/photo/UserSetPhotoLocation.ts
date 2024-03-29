import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'

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
