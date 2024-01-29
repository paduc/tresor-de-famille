import { ulid } from 'ulid'
import { CommentId } from '../domain/CommentId'

export const makeCommentId = (): CommentId => {
  return ulid() as CommentId
}
