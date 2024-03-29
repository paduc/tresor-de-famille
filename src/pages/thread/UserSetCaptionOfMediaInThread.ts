import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { MediaId } from '../../domain/MediaId.js'
import { ThreadId } from '../../domain/ThreadId.js'
export type UserSetCaptionOfMediaInThread = DomainEvent<
  'UserSetCaptionOfMediaInThread',
  {
    mediaId: MediaId
    threadId: ThreadId
    userId: AppUserId
    caption: string
  }
>

export const UserSetCaptionOfMediaInThread = makeDomainEvent<UserSetCaptionOfMediaInThread>('UserSetCaptionOfMediaInThread')
