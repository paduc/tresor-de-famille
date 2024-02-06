import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsThreadId } from '../../domain/ThreadId'
import { pageRouter } from '../pageRouter'
import { AddCommentApiURL } from './AddCommentApiURL'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserAddedCommentOnThread } from '../thread/UserAddedCommentOnThread'
import { makeCommentId } from '../../libs/makeCommentId'
import { isThreadSharedWithUser } from '../_isThreadSharedWithUser'
import { getThreadComments } from './getThreadComments'

pageRouter.route(AddCommentApiURL).post(requireAuth(), async (request, response, next) => {
  try {
    const { threadId, comment } = zod
      .object({
        threadId: zIsThreadId,
        comment: zod.string(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    if (!(await isThreadSharedWithUser({ threadId, userId }))) {
      return response.status(403).send("Vous n'avez pas le droit de commenter sur cette histoire.")
    }

    await addToHistory(
      UserAddedCommentOnThread({
        commentId: makeCommentId(),
        userId,
        threadId,
        body: comment,
      })
    )

    const comments = await getThreadComments({ threadId })

    return response.status(200).json({ comments })
  } catch (error) {
    console.error(`Error in ${AddCommentApiURL} route`)
    return response.status(500).send('Une erreur sur le serveur a empêché de prendre en compte votre commentaire.')
  }
})
