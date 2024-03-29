import { getEventList } from '../dependencies/getEventList.js'
import { PhotoId } from '../domain/PhotoId.js'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { UserAddedCaptionToPhoto } from './photo/UserAddedCaptionToPhoto.js'
import { UserDeletedPhoto } from './photoApi/UserDeletedPhoto.js'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily.js'
import { PhotoAutoSharedWithThread } from './thread/PhotoAutoSharedWithThread.js'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'

export type PhotoEvent =
  | UserUploadedPhotoToChat
  | UserUploadedPhotoToFamily
  | UserUploadedPhoto
  | UserInsertedPhotoInRichTextThread
  | UserDeletedPhoto
  | UserAddedCaptionToPhoto
  | OnboardingUserUploadedPhotoOfThemself
  | OnboardingUserUploadedPhotoOfFamily
  | PhotoAutoSharedWithThread

export async function getPhotoEvents(photoId: PhotoId): Promise<PhotoEvent[]> {
  const photoEvents = await getEventList<
    | UserUploadedPhotoToChat
    | UserUploadedPhotoToFamily
    | UserUploadedPhoto
    | UserInsertedPhotoInRichTextThread
    | UserDeletedPhoto
    | UserAddedCaptionToPhoto
    | OnboardingUserUploadedPhotoOfThemself
    | OnboardingUserUploadedPhotoOfFamily
    | PhotoAutoSharedWithThread
  >(
    [
      'UserUploadedPhotoToChat',
      'UserUploadedPhotoToFamily',
      'UserUploadedPhoto',
      'UserInsertedPhotoInRichTextThread',
      'UserDeletedPhoto',
      'UserAddedCaptionToPhoto',
      'OnboardingUserUploadedPhotoOfFamily',
      'OnboardingUserUploadedPhotoOfThemself',
      'PhotoAutoSharedWithThread',
    ],
    {
      photoId,
    }
  )

  return photoEvents
    .filter((event): event is PhotoEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
