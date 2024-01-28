import { pipeline } from 'node:stream'
import sharp from 'sharp'
import { z } from 'zod'

import { requireAuth } from '../../dependencies/authn'
import { downloadPhoto } from '../../dependencies/photo-storage'
import { zIsPhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { pageRouter } from '../pageRouter'
import { ThumbnailURL } from './ThumbnailURL'

pageRouter.route(ThumbnailURL(':photoId')).get(requireAuth(), async (request, response) => {
  try {
    const { photoId } = z.object({ photoId: zIsPhotoId }).parse(request.params)

    if (!(await doesPhotoExist({ photoId }))) {
      return response.status(404).send('Photo introuvable')
    }

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')

    // Keep the await to avoid memory leaks
    await pipeline(downloadPhoto(photoId), sharp().resize(300, 300, { fit: 'cover' }).rotate(), response, async (err) => {
      if (err) console.error('error on thumbnail pipeline', err)
    })
  } catch (error) {
    console.error('cannot load thumbnail', error)
    response.status(500).send('cannot load thumbnail')
  }
})
