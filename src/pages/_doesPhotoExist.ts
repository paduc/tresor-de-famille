import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat'

export const doesPhotoExist = async ({ photoId, familyId }: { photoId: PhotoId; familyId: FamilyId }): Promise<boolean> => {
  const photoUploaded = await getSingleEvent<
    | UserUploadedPhotoToChat
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | PhotoClonedForSharing
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'UserUploadedPhotoToChat',
      'OnboardingUserUploadedPhotoOfThemself',
      'OnboardingUserUploadedPhotoOfFamily',
      'PhotoClonedForSharing',
      'UserInsertedPhotoInRichTextThread',
    ],
    {
      photoId,
      familyId,
    }
  )

  return !!photoUploaded
}
