import zod from 'zod'
import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { actionsRouter } from './actionsRouter'
import { zIsUUID } from '../domain'
import { downloadPhoto } from '../dependencies/photo-storage'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /photos/${request.params.photoId}`)

  const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)

  response.set('Content-Type', 'image/*')

  downloadPhoto(photoId).pipe(response)
})
