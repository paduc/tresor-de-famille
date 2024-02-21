import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'

export type UserSetPhotoDate = DomainEvent<
  'UserSetPhotoDate',
  {
    photoId: PhotoId
    userId: AppUserId
  } & ({ dateOption: 'user'; dateAsText: string } | { dateOption: 'exif' | 'none' })
>

export const UserSetPhotoDate = makeDomainEvent<UserSetPhotoDate>('UserSetPhotoDate')
