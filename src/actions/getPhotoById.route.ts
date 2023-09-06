import zod from 'zod'
import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { actionsRouter } from './actionsRouter'
import { zIsUUID } from '../domain'
import { downloadPhoto } from '../dependencies/photo-storage'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)

  response.set('Content-Type', 'image/*')
  response.set('Cache-Control', 'private, max-age=15552000')

  downloadPhoto(photoId).pipe(response)
})
