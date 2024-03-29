import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { CommentId } from '../../domain/CommentId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export type UserAddedCommentOnThread = DomainEvent<
  'UserAddedCommentOnThread',
  {
    commentId: CommentId
    body: string

    threadId: ThreadId
    userId: AppUserId
  }
>

export const UserAddedCommentOnThread = makeDomainEvent<UserAddedCommentOnThread>('UserAddedCommentOnThread')
