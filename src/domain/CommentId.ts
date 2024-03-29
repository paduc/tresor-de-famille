import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type CommentId = string & { isCommentId: true }

export const isCommentId = (commentId: any): commentId is CommentId => isUUID(commentId)

export const zIsCommentId = zCustom(isCommentId)
