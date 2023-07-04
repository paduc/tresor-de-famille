import fs from 'node:fs'
import { uploadPhoto } from '../../../dependencies/photo-storage'
import { addToHistory } from '../../../dependencies/addToHistory'
import { UUID } from '../../../domain'
import { getUuid } from '../../../libs/getUuid'
import { OnboardingUserUploadedPhotoOfThemself } from './OnboardingUserUploadedPhotoOfThemself'
import { detectFacesInPhotoUsingAWS } from '../../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'

type UploadUserPhotoOfThemselfArgs = {
  file: Express.Multer.File
  userId: UUID
}
export async function uploadUserPhotoOfThemself({ file, userId }: UploadUserPhotoOfThemselfArgs) {
  const { path: originalPath } = file
  const photoId = getUuid()

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(
    OnboardingUserUploadedPhotoOfThemself({
      photoId,
      location,
      uploadedBy: userId,
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })
}
