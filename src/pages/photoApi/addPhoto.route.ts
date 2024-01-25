import multer from 'multer'
import fs from 'node:fs'
import zod from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { uploadPhoto } from '../../dependencies/photo-storage'
import { zIsFamilyId } from '../../domain/FamilyId'
import { makePhotoId } from '../../libs/makePhotoId'
import { pageRouter } from '../pageRouter'
import { UserUploadedPhoto } from './UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './UserUploadedPhotoToFamily'
import { detectFacesInPhotoUsingAWS } from '../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { getExif } from './getExif'
import { PhotoListPage } from '../photoList'
import { PhotoListPageUrl } from '../photoList/PhotoListPageUrl'

const FILE_SIZE_LIMIT_MB = 20
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

/**
 * Used by the InlinePhotoUpload component
 * The difference with upload-photo is that it returns to the previous page
 * It uses a form to upload and redirect
 */
pageRouter.route('/add-photo.html').post(requireAuth(), upload.single('photo'), async (request, response) => {
  try {
    const { familyId } = zod
      .object({
        familyId: zIsFamilyId.optional(),
      })
      .parse(request.body)

    const userId = request.session.user!.id

    const { file } = request

    if (!file) return new Error('We did not receive any image.')

    const { path: originalPath } = file
    const photoId = makePhotoId()

    const exif = getExif(file)

    const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

    if (familyId) {
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
    detectFacesInPhotoUsingAWS({ file, photoId })

    if (familyId) {
      return response.redirect(`/photo/${photoId}/photo.html?photoListForFamilyId=${familyId}`)
    }

    return response.redirect(`/photo/${photoId}/photo.html`)
  } catch (error) {
    console.error('Error in chat route')
    throw error
  }
})
