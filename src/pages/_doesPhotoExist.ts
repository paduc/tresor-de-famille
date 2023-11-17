import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat'

export const doesPhotoExist = async ({ photoId, familyId }: { photoId: PhotoId; familyId: FamilyId }): Promise<boolean> => {
  const photoUploaded = await getSingleEvent<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfThemself | OnboardingUserUploadedPhotoOfFamily
  >(['UserUploadedPhotoToChat', 'OnboardingUserUploadedPhotoOfThemself', 'OnboardingUserUploadedPhotoOfFamily'], {
    photoId,
    familyId,
  })

  const photoInserted = await getSingleEvent<UserInsertedPhotoInRichTextThread>(['UserInsertedPhotoInRichTextThread'], {
    photoId,
    familyId,
  })

  return !!photoUploaded || !!photoInserted
}
