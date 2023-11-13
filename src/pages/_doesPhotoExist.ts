import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PhotoId } from '../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat'

export const doesPhotoExist = async ({ photoId, userId }: { photoId: PhotoId; userId: AppUserId }): Promise<boolean> => {
  const photoUploaded = await getSingleEvent<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfThemself | OnboardingUserUploadedPhotoOfFamily
  >(['UserUploadedPhotoToChat', 'OnboardingUserUploadedPhotoOfThemself', 'OnboardingUserUploadedPhotoOfFamily'], {
    photoId,
    uploadedBy: userId,
  })

  const photoInserted = await getSingleEvent<UserInsertedPhotoInRichTextThread>(['UserInsertedPhotoInRichTextThread'], {
    photoId,
    userId,
  })

  return !!photoUploaded || !!photoInserted
}
