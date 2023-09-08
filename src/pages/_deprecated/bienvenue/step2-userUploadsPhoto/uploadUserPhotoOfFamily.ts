import fs from 'node:fs'
import { uploadPhoto } from '../../../../dependencies/photo-storage'
import { addToHistory } from '../../../../dependencies/addToHistory'
import { UUID } from '../../../../domain'
import { getUuid } from '../../../../libs/getUuid'
import { detectFacesInPhotoUsingAWS } from '../../../photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS'
import { OnboardingUserUploadedPhotoOfFamily } from '../../../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'

type UploadUserPhotoOfFamilyArgs = {
  file: Express.Multer.File
  userId: UUID
}
export async function uploadUserPhotoOfFamily({ file, userId }: UploadUserPhotoOfFamilyArgs) {
  const { path: originalPath } = file
  const photoId = getUuid()

  const location = await uploadPhoto({ contents: fs.createReadStream(originalPath), id: photoId })

  await addToHistory(
    OnboardingUserUploadedPhotoOfFamily({
      photoId,
      location,
      uploadedBy: userId,
    })
  )

  await detectFacesInPhotoUsingAWS({ file, photoId })
}
