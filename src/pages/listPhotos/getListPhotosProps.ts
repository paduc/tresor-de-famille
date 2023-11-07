import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { ListPhotosProps } from './ListPhotosPage'
import { UserInsertedPhotoInRichTextThread } from '../chat/UserInsertedPhotoInRichTextThread'
import { UserDeletedPhoto } from '../photo/UserDeletedPhoto'

export const getListPhotosProps = async (userId: UUID): Promise<ListPhotosProps> => {
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
