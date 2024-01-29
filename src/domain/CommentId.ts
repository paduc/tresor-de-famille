import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type CommentId = string & { isCommentId: true }

export const isCommentId = (commentId: any): commentId is CommentId => isUUID(commentId)

export const zIsCommentId = zCustom(isCommentId)
