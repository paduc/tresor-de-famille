import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain/UUID'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserInsertedPhotoInRichTextThread } from './chat/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './chat/uploadPhotoToChat/UserUploadedPhotoToChat'

export const getPhotoAuthor = async ({ photoId }: { photoId: UUID }): Promise<UUID | null> => {
  const photoEvent = await getSingleEvent<
    | UserUploadedPhotoToChat
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'UserUploadedPhotoToChat',
      'OnboardingUserUploadedPhotoOfThemself',
      'OnboardingUserUploadedPhotoOfFamily',
      'UserInsertedPhotoInRichTextThread',
    ],
    {
      photoId,
    }
  )

  // @ts-ignore
  return photoEvent ? { createdBy: photoEvent.payload.userId || photoEvent.payload.uploadedBy } : false
}
