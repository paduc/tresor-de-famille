import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { UserDeletedPhoto } from '../photo/UserDeletedPhoto'
import { ListPhotosProps } from './ListPhotosPage'
import { FamilyId } from '../../domain/FamilyId'

export const getListPhotosProps = async (familyId: FamilyId): Promise<ListPhotosProps> => {
  const uploadedPhotos = await getEventList<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
  >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], {
    familyId,
  })

  const insertedPhotos = await getEventList<UserInsertedPhotoInRichTextThread>('UserInsertedPhotoInRichTextThread', {
    familyId,
  })

  const deletedPhotosEvents = await getEventList<UserDeletedPhoto>('UserDeletedPhoto', { familyId })
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
