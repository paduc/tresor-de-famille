import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { localFilePath } from '../dependencies/uploadPhoto'
import { actionsRouter } from './actionsRouter'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /photos/${request.params.photoId}`)

  const { photoId } = request.params

  response.send(fs.createReadStream(localFilePath(photoId)))
})
