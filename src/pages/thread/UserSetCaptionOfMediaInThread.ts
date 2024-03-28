import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { MediaId } from '../../domain/MediaId'
import { ThreadId } from '../../domain/ThreadId'
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
