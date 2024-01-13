import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserAddedCaptionToPhoto } from './photo/UserAddedCaptionToPhoto'
import { UserDeletedPhoto } from './photoApi/UserDeletedPhoto'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily'
import { PhotoAutoSharedWithThread } from './thread/PhotoAutoSharedWithThread'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from './thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from './thread/uploadPhotoToChat/UserUploadedPhotoToChat'

export type PhotoEvent =
  | PhotoClonedForSharing
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
  const photoClonedEvent = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })

  const updateEvents = await getEventList<
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

  return [photoClonedEvent, ...updateEvents]
    .filter((event): event is PhotoEvent => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
