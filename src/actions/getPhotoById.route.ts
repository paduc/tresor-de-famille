import zod from 'zod'
import { requireAuth } from '../dependencies/authn'
import { downloadPhoto } from '../dependencies/photo-storage'
import { zIsPhotoId } from '../domain/PhotoId'
import { doesPhotoExist } from '../pages/_doesPhotoExist'
import { actionsRouter } from './actionsRouter'

actionsRouter.route('/photos/:photoId').get(requireAuth(), async (request, response) => {
  try {
    const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.params)

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')

    const photoExists = await doesPhotoExist({ photoId })
    if (!photoExists) return response.sendStatus(404)

    downloadPhoto(photoId).pipe(response)
  } catch (error) {
    console.error('getPhotoById', error)
    response.status(500).send()
  }
})
