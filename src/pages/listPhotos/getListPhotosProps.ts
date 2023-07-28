import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserUploadedPhotoOfFamily } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { ListPhotosProps } from './ListPhotosPage'

export const getListPhotosProps = async (userId: UUID): Promise<ListPhotosProps> => {
  const photos = await getEventList<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
  >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], {
    uploadedBy: userId,
  })

  return {
    photos: photos.map(({ payload: { photoId } }) => ({
      photoId,
      url: getPhotoUrlFromId(photoId),
    })),
  }
}
