import sharp from 'sharp'
import { createReadStream } from 'node:fs'
import path from 'node:path'
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

    // Get the original image as a Readable stream
    const originalImageStream = downloadPhoto(photoId).on('error', (err) => {
      console.error(err)
      throw new Error('Error during downloadPhoto')
    })

    const pipeline = sharp()
      .resize(300, 300, { fit: 'cover' })
      .rotate()
      .on('error', (err) => {
        console.error(err)
        throw new Error('Error during sharp')
      }) // to keep original orientation

    originalImageStream.pipe(pipeline).on('error', (err) => {
      console.error(err)
      throw new Error('Error during piping between originalImageStream and sharp')
    })

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')
    pipeline.pipe(response).on('error', (err) => {
      console.error(err)
      throw new Error('Error during piping to response')
    })
  } catch (error) {
    console.error('getPhotoThumbnail', error)

    createReadStream(path.join(path.join(__dirname, '../../assets/error-thumbnail.png')))
      .pipe(response)
      .on('error', (err) => {
        console.error(err)
        throw new Error('error piping to placeholder')
      })
  }
})
