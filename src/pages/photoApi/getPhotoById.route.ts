import zod from 'zod'
import { pipeline } from 'node:stream'
import { requireAuth } from '../../dependencies/authn'
import { downloadPhoto } from '../../dependencies/photo-storage'
import { zIsPhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { pageRouter } from '../pageRouter'
import { PhotoURL } from './PhotoURL'

pageRouter.route(PhotoURL(':photoId')).get(requireAuth(), async (request, response, next) => {
  try {
    const { photoId } = zod.object({ photoId: zIsPhotoId }).parse(request.params)

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')

    const photoExists = await doesPhotoExist({ photoId })
    if (!photoExists) return response.sendStatus(404)

    // Await is necessary here to avoid memory leaks
    await pipeline(downloadPhoto(photoId), response, async (err) => {
      if (err) {
        console.error(`error on image serving photoId=${photoId}`, err)
        next(err)
      }
    })
  } catch (error) {
    console.error('getPhotoById', error)
    next(error)
  }
})
