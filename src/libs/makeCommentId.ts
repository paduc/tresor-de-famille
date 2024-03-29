import { ulid } from 'ulid'
import { CommentId } from '../domain/CommentId.js'

export const makeCommentId = (): CommentId => {
  return ulid() as CommentId
}
