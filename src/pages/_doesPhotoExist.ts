import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat'

export const doesPhotoExist = async ({ photoId }: { photoId: PhotoId }): Promise<boolean> => {
  const photoUploaded = await getSingleEvent<
    | UserUploadedPhotoToChat
    | UserUploadedPhotoToFamily
    | UserUploadedPhoto
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | PhotoClonedForSharing
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'UserUploadedPhotoToChat',
      'UserUploadedPhotoToFamily',
      'UserUploadedPhoto',
      'OnboardingUserUploadedPhotoOfThemself',
      'OnboardingUserUploadedPhotoOfFamily',
      'PhotoClonedForSharing',
      'UserInsertedPhotoInRichTextThread',
    ],
    {
      photoId,
    }
  )

  return !!photoUploaded
}
