import zod from 'zod'
import fs from 'node:fs'
import { requireAuth } from '../dependencies/authn'
import { actionsRouter } from './actionsRouter'
import { zIsUUID } from '../domain'
import { downloadPhoto } from '../dependencies/photo-storage'
import { postgres } from '../dependencies/database'
import { AWSDetectedFacesInPhoto } from '../pages/photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import sharp from 'sharp'

actionsRouter.route('/photo/:photoId/face/:faceId').get(requireAuth(), async (request, response) => {
  const { photoId, faceId } = zod.object({ photoId: zIsUUID, faceId: zIsUUID }).parse(request.params)

  const { rows } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" DESC LIMIT 1",
    [photoId]
  )

  if (!rows.length) throw new Error('No face detection for this photo.')

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

  // Find the longest side of the bounding box
  const longestSide = Math.max(boxWidth, boxHeight)

  // Calculate the square coordinates
  let squareTop = Math.round(boxTop + (boxHeight - longestSide) / 2)
  let squareLeft = Math.round(boxLeft + (boxWidth - longestSide) / 2)

  // Ensure the extracted area does not exceed the image boundaries
  if (squareTop < 0) {
    squareTop = 0
  } else if (squareTop + longestSide > imageMetadata.height!) {
    squareTop = imageMetadata.height! - longestSide
  }

  if (squareLeft < 0) {
    squareLeft = 0
  } else if (squareLeft + longestSide > imageMetadata.width!) {
    squareLeft = imageMetadata.width! - longestSide
  }

  // Extract the square portion of the image using the bounding box
  const extractedImage = pipeline
    .extract({
      width: Math.min(longestSide, imageMetadata.width! - squareLeft),
      height: Math.min(longestSide, imageMetadata.height! - squareTop),
      top: Math.max(0, squareTop),
      left: Math.max(0, squareLeft),
    })
    .rotate() // to keep original orientation (based on exif)
  // .withMetadata() // could also be used

  response.set('Content-Type', 'image/*')
  response.set('Cache-Control', 'private, max-age=15552000')

  extractedImage.pipe(response)
})
