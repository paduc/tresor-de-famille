import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { UUID } from '../domain/UUID'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserInsertedPhotoInRichTextThread } from './chat/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './chat/uploadPhotoToChat/UserUploadedPhotoToChat'

export const doesPhotoExist = async ({ photoId, userId }: { photoId: PhotoId; userId: UUID }): Promise<boolean> => {
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
