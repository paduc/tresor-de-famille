import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserDeletedPhoto } from '../photo/UserDeletedPhoto'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoListProps } from './PhotoListPage'

export const getListPhotosProps = async (userId: AppUserId): Promise<PhotoListProps> => {
  const uploadedPhotos = await getEventList<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
  >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], {
    uploadedBy: userId,
  })

  const insertedPhotos = await getEventList<UserInsertedPhotoInRichTextThread>('UserInsertedPhotoInRichTextThread', {
    userId,
  })

  const deletedPhotosEvents = await getEventList<UserDeletedPhoto>('UserDeletedPhoto', { userId })
  const deletedPhotoIds = deletedPhotosEvents.map((deletionEvent) => deletionEvent.payload.photoId)

  const photos = [...uploadedPhotos, ...insertedPhotos].filter(
    (creationEvent) => !deletedPhotoIds.includes(creationEvent.payload.photoId)
  )

  return {
    photos: photos.map(({ payload: { photoId } }) => ({
      photoId,
      url: getPhotoUrlFromId(photoId),
    })),
  }
}
