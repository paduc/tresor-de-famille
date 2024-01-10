import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { isPhotoDeleted } from '../_isPhotoDeleted'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoListProps } from './PhotoListPage'

type GetPhotoListPageProsArgs = {
  familyId: FamilyId
  userId: AppUserId
}

export const getPhotoListPageProps = async ({ userId, familyId }: GetPhotoListPageProsArgs): Promise<PhotoListProps> => {
  const photoList = await getEventList<
    | UserUploadedPhotoToChat
    | OnboardingUserUploadedPhotoOfFamily
    | OnboardingUserUploadedPhotoOfThemself
    | UserInsertedPhotoInRichTextThread
  >(
    [
      'OnboardingUserUploadedPhotoOfFamily',
      'OnboardingUserUploadedPhotoOfThemself',
      'UserUploadedPhotoToChat',
      'UserInsertedPhotoInRichTextThread',
    ],
    {
      familyId,
    }
  )

  const photos = []

  for (const photoEvent of photoList) {
    if (await isPhotoDeleted(photoEvent.payload.photoId)) continue
    // if (await isPhotoCloned(photoEvent.payload.photoId)) continue
    photos.push(photoEvent)
  }

  return {
    photos: photos.map(({ payload: { photoId } }) => ({
      photoId,
    })),
    currentFamilyId: familyId,
  }
}
