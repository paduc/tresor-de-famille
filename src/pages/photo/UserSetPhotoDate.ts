import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'

export type UserSetPhotoDate = DomainEvent<
  'UserSetPhotoDate',
  {
    photoId: PhotoId
    userId: AppUserId
  } & ({ dateOption: 'user'; dateAsText: string } | { dateOption: 'exif' | 'none' })
>

export const UserSetPhotoDate = makeDomainEvent<UserSetPhotoDate>('UserSetPhotoDate')
