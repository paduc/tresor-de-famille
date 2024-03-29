import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
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
