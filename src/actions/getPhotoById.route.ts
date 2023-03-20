import zod from 'zod'
import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { localFilePath } from '../dependencies/uploadPhoto'
import { actionsRouter } from './actionsRouter'
import { zIsUUID } from '../domain'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /photos/${request.params.photoId}`)

  const { photoId } = zod.object({ photoId: zIsUUID }).parse(request.params)

  const localPath = localFilePath(photoId)

  response.set('Content-Type', 'image/*')
  fs.createReadStream(localPath).pipe(response)
})
