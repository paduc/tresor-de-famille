import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { CommentId } from '../../domain/CommentId'
import { ThreadId } from '../../domain/ThreadId'

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
