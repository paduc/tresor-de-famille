import zod, { z } from 'zod'
import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { actionsRouter } from './actionsRouter'
import { zIsUUID } from '../domain'
import { downloadPhoto } from '../dependencies/photo-storage'
import { getPhotoAuthor } from '../pages/_getPhotoAuthor'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UserReceivedAccessToThread } from '../pages/chat/UserReceivedAccessToThread'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  try {
    const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)
    const { threadId } = z.object({ threadId: z.string().optional() }).parse(request.query)
    const userId = request.session.user!.id

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')

    const photoAuthorId = await getPhotoAuthor({ photoId })
    if (!photoAuthorId) {
      return response.sendStatus(404)
    }

    if (userId !== photoAuthorId) {
      const { threadId } = z.object({ threadId: z.string().optional() }).parse(request.query)

      // Look for a right to get this photo

      if (!threadId) return response.sendStatus(403)

      const accessReceivedEvent = await getSingleEvent<UserReceivedAccessToThread>('UserReceivedAccessToThread', {
        chatId: threadId,
        userId,
      })

      if (!accessReceivedEvent) return response.sendStatus(403)
    }

    downloadPhoto(photoId).pipe(response)
  } catch (error) {
    console.error('getPhotoById', error)
    response.status(500).send()
  }
})
