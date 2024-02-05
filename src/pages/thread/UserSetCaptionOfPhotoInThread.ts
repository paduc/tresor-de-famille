import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
export type UserSetCaptionOfPhotoInThread = DomainEvent<
  'UserSetCaptionOfPhotoInThread',
  {
    photoId: PhotoId
    threadId: ThreadId
    userId: AppUserId
    caption: string
  }
>

export const UserSetCaptionOfPhotoInThread = makeDomainEvent<UserSetCaptionOfPhotoInThread>('UserSetCaptionOfPhotoInThread')
