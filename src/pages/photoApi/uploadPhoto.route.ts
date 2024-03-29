import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import zod, { z } from 'zod'
import { captureException } from '@sentry/node'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { requireAuth } from '../../dependencies/authn.js'
import { uploadPhoto } from '../../dependencies/photo-storage.js'
import { zIsFamilyId } from '../../domain/FamilyId.js'
import { makePhotoId } from '../../libs/makePhotoId.js'
import { pageRouter } from '../pageRouter.js'
import { UserUploadedPhoto } from './UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './UserUploadedPhotoToFamily.js'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS.js'
import { asFamilyId } from '../../libs/typeguards.js'

import { getExif } from './getExif.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { EXIF } from '../../libs/exif.js'
import { getGPSDecCoordsFromExif } from '../../libs/getGPSDecCoordsFromExif.js'
import { geocodeService } from '../../dependencies/mapbox.js'
import { PhotoGPSReverseGeocodedUsingMapbox } from './PhotoGPSReverseGeocodedUsingMapbox.js'
import { SENTRY_DSN } from '../../dependencies/env.js'

const FILE_SIZE_LIMIT_MB = 20
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

/**
 * This entry-point is for Client-side upload (see Multiupload.tsx)
 */
pageRouter.route('/upload-photo').post(requireAuth(), upload.single('photo'), async (request, response, next) => {
  try {
    const { familyId } = zod
      .object({
        familyId: zIsFamilyId.optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    const { file } = request
    if (!file) return new Error("Aucune photo n'a été reçue par le server.")

    const { path: originalPath } = file
    const photoId = makePhotoId()

    const exif = getExif(file)

    const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

    if (familyId && familyId !== asFamilyId(userId)) {
      await addToHistory(
        UserUploadedPhotoToFamily({
          photoId,
          location,
          userId,
          familyId,
          exif,
        })
      )
    } else {
      await addToHistory(
        UserUploadedPhoto({
          photoId,
          location,
          userId,
          exif,
        })
      )
    }

    // Fire and forget
    getPhotoLocationUsingMapbox({ exif, photoId })
    detectFacesInPhotoUsingAWS({ file, photoId })

    return response.status(200).json({ photoId })
  } catch (error) {
    console.error('Error in /upload-image route')
    next(error)
  }
})

async function getPhotoLocationUsingMapbox({ exif, photoId }: { exif: EXIF | undefined; photoId: PhotoId }) {
  if (!exif) return

  const GPSCoords = getGPSDecCoordsFromExif(exif)
  if (!GPSCoords) return

  try {
    const { lat, long } = GPSCoords

    const latitude = z.number().min(-90).max(90).parse(lat)
    const longitude = z.number().min(-180).max(180).parse(long)

    const geocoding = await geocodeService.reverseGeocode({ query: [longitude, latitude] }).send()

    if (geocoding.body.features.length) {
      await addToHistory(
        PhotoGPSReverseGeocodedUsingMapbox({
          photoId,
          geocode: geocoding.body,
          geocodeApiVersion: '5',
        })
      )
    }
  } catch (error) {
    console.error(`getPhotoLocationUsingMapbox ${photoId}`, error)
    if (SENTRY_DSN) {
      captureException(error)
    }
  }
}
