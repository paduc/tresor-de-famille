import { pipeline } from 'node:stream'
import sharp from 'sharp'
import { z } from 'zod'

import { requireAuth } from '../../dependencies/authn.js'
import { downloadPhoto } from '../../dependencies/photo-storage.js'
import { zIsPhotoId } from '../../domain/PhotoId.js'
import { doesPhotoExist } from '../_doesPhotoExist.js'
import { pageRouter } from '../pageRouter.js'
import { ThumbnailURL } from './ThumbnailURL.js'

pageRouter.route(ThumbnailURL(':photoId')).get(requireAuth(), async (request, response, next) => {
  try {
    const { photoId } = z.object({ photoId: zIsPhotoId }).parse(request.params)

    if (!(await doesPhotoExist({ photoId }))) {
      return response.status(404).send('Photo introuvable')
    }

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')

    // Keep the await to avoid memory leaks
    await pipeline(downloadPhoto(photoId), sharp().resize(300, 300, { fit: 'cover' }).rotate(), response, async (err) => {
      if (err) {
        console.error(`error on thumbnail pipeline photoId=${photoId}`, err)
        next(err)
      }
    })
  } catch (error) {
    console.error('cannot load thumbnail', error)
    next(error)
  }
})
