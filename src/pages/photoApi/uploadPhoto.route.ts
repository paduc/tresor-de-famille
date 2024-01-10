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

const FILE_SIZE_LIMIT_MB = 20
const upload = multer({
  dest: 'temp/photos',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

/**
 * This entry-point is for Client-side upload (see Multiupload.tsx)
 */
pageRouter.route('/upload-photo').post(requireAuth(), upload.single('photo'), async (request, response) => {
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

    const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

    if (familyId) {
      await addToHistory(
        UserUploadedPhotoToFamily({
          photoId,
          location,
          userId,
          familyId,
        })
      )
    } else {
      await addToHistory(
        UserUploadedPhoto({
          photoId,
          location,
          userId,
        })
      )
    }

    // Fire and forget
    detectFacesInPhotoUsingAWS({ file, photoId })

    return response.status(200).json({ photoId })
  } catch (error) {
    console.error('Error in /upload-image route')
    throw error
  }
})
