import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { PhotoId } from '../domain/PhotoId.js'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily.js'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'

export const doesPhotoExist = async ({ photoId }: { photoId: PhotoId }): Promise<boolean> => {
  const photoUploaded = await getSingleEvent<
    | UserUploadedPhotoToChat
    | UserUploadedPhotoToFamily
    | UserUploadedPhoto
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'UserUploadedPhotoToChat',
      'UserUploadedPhotoToFamily',
      'UserUploadedPhoto',
      'OnboardingUserUploadedPhotoOfThemself',
      'OnboardingUserUploadedPhotoOfFamily',
      'UserInsertedPhotoInRichTextThread',
    ],
    {
      photoId,
    }
  )

  return !!photoUploaded
}
