import { getEventList } from '../../dependencies/getEventList'
import { ThreadId } from '../../domain/ThreadId'
import { getPersonForUser } from '../_getPersonForUser'
import { getProfilePicUrlForUser } from '../_getProfilePicUrlForUser'
import { Comment } from '../thread/ThreadPage/_components/Comments'
import { UserAddedCommentOnThread } from '../thread/UserAddedCommentOnThread'

export async function getThreadComments({ threadId }: { threadId: ThreadId }): Promise<Comment[]> {
  const comments: Comment[] = []
  const commentEvents = await getEventList<UserAddedCommentOnThread>('UserAddedCommentOnThread', { threadId })

  for (const {
    payload: { commentId, userId, body },
    occurredAt,
  } of commentEvents) {
    const author = await getPersonForUser({ userId })
    const name = author?.name || 'Sans nom'
    const profilePic = await getProfilePicUrlForUser(userId)

    comments.push({
      commentId,
      author: { name, profilePicUrl: profilePic || '' },
      body,
      dateTime: occurredAt.toISOString(),
    })
  }

  return comments
}
