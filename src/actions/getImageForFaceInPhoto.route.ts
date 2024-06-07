import sharp from 'sharp'
import zod from 'zod'
import { requireAuth } from '../dependencies/authn.js'
import { postgres } from '../dependencies/database.js'
import { downloadPhoto } from '../dependencies/photo-storage.js'
import { zIsFaceId } from '../domain/FaceId.js'
import { zIsPhotoId } from '../domain/PhotoId.js'
import { doesPhotoExist } from '../pages/_doesPhotoExist.js'
import { AWSDetectedFacesInPhoto } from '../pages/photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto.js'
import { actionsRouter } from './actionsRouter.js'
import { PhotoFaceURL } from './PhotoFaceURL.js'

actionsRouter.route(PhotoFaceURL()).get(async (request, response, next) => {
  try {
    const { photoId, faceId } = zod.object({ photoId: zIsPhotoId, faceId: zIsFaceId }).parse(request.params)

    const photoExists = await doesPhotoExist({ photoId })
    if (!photoExists) return response.sendStatus(404)

    const { rows } = await postgres.query<AWSDetectedFacesInPhoto>(
      "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
      [photoId]
    )

    if (!rows.length) {
      throw new Error('No face detection for this photo.')
    }

    const face = rows[0].payload.faces.find((face) => face.faceId === faceId)

    if (!face) throw new Error('Face with this faceId does not appear to have been detected on this photo.')

    const { Width: oWidth, Height: oHeight, Top: oTop, Left: oLeft } = face.position

    // Add some more space around the face
    const spacing = 1.4
    const Width = oWidth! * spacing
    const Height = oHeight! * spacing
    const Top = oTop! - (Height - oHeight!) / 2
    const Left = oLeft! - (Width - oWidth!) / 2

    // Get the original image as a Readable stream
    const originalImageStream = downloadPhoto(photoId)

    const pipeline = sharp()

    originalImageStream.pipe(pipeline)
    // Calculate the coordinates based on the bounding box percentages
    const imageMetadata = await pipeline.metadata()
    const boxWidth = Math.round(imageMetadata.width! * Width!)
    const boxHeight = Math.round(imageMetadata.height! * Height!)
    const boxTop = Math.round(imageMetadata.height! * Top!)
    const boxLeft = Math.round(imageMetadata.width! * Left!)

    // console.log(JSON.stringify(imageMetadata, null, 2))

    // Find the longest side of the bounding box
    const longestSide = Math.max(boxWidth, boxHeight)

    // Calculate the square coordinates
    let squareTop = Math.round(boxTop + (boxHeight - longestSide) / 2)
    let squareLeft = Math.round(boxLeft + (boxWidth - longestSide) / 2)

    // Ensure the extracted area does not exceed the image boundaries
    if (squareTop < 0) {
      squareTop = 0
    } else if (squareTop + longestSide > imageMetadata.height!) {
      squareTop = Math.max(0, imageMetadata.height! - longestSide)
    }

    if (squareLeft < 0) {
      squareLeft = 0
    } else if (squareLeft + longestSide > imageMetadata.width!) {
      squareLeft = Math.max(0, imageMetadata.width! - longestSide)
    }

    // console.log(JSON.stringify({ squareLeft, squareTop, longestSide }, null, 2))

    // Extract the square portion of the image using the bounding box
    const extractZone = {
      width: Math.min(longestSide, imageMetadata.width! - squareLeft),
      height: Math.min(longestSide, imageMetadata.height! - squareTop),
      top: Math.max(0, squareTop),
      left: Math.max(0, squareLeft),
    }

    response.set('Content-Type', 'image/*')
    response.set('Cache-Control', 'private, max-age=15552000')
    try {
      const extractedImage = pipeline.extract(extractZone).rotate() // to keep original orientation (based on exif) // to keep original orientation (based on exif)
      // .withMetadata() // could also be used

      extractedImage.pipe(response)
    } catch (error) {
      console.error('Bad extraction zone', error)
      // send the full image instead
      // TODO: send placeholder
      originalImageStream.pipe(response)
    }
  } catch (error) {
    console.error('getImageForFaceInPhoto', error)
    response.status(500).send()
    next(error)
  }
})
