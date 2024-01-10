import sharp from 'sharp'
import { z } from 'zod'

import { requireAuth } from '../../dependencies/authn'
import { downloadPhoto } from '../../dependencies/photo-storage'
import { zIsPhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { ThumbnailURL } from './ThumbnailURL'
import { getOriginalPhotoId } from '../_getOriginalPhotoId'
import { pageRouter } from '../pageRouter'

pageRouter.route(ThumbnailURL(':photoId')).get(requireAuth(), async (request, response) => {
  try {
    const { photoId } = z.object({ photoId: zIsPhotoId }).parse(request.params)

    if (!(await doesPhotoExist({ photoId }))) {
      return response.status(404).send('Photo introuvable')
    }

    const originalPhotoId = await getOriginalPhotoId(photoId)

    // Get the original image as a Readable stream
    const originalImageStream = downloadPhoto(originalPhotoId)

    const pipeline = sharp().resize(300, 300, { fit: 'cover' }).rotate() // to keep original orientation

    originalImageStream.pipe(pipeline)

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')
    pipeline.pipe(response)
  } catch (error) {
    console.error('getPhotoThumbnail', error)
    response.status(500).send()
  }
})
