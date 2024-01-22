import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { asFamilyId } from '../../libs/typeguards'
import { PhotoEvent } from '../_getPhotoEvents'
import { isPhotoDeleted } from '../_isPhotoDeleted'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from '../photoApi/UserUploadedPhotoToFamily'
import { PhotoAutoSharedWithThread } from '../thread/PhotoAutoSharedWithThread'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoListProps } from './PhotoListPage'

type GetPhotoListPageProsArgs = {
  userId: AppUserId
  familyId?: FamilyId
}

export const getPhotoListPageProps = async ({ userId, familyId }: GetPhotoListPageProsArgs): Promise<PhotoListProps> => {
  const photos: PhotoEvent[] = []

  photos.push(
    ...(await getEventList<
      | UserUploadedPhotoToChat
      | UserUploadedPhotoToFamily
      | UserInsertedPhotoInRichTextThread
      | OnboardingUserUploadedPhotoOfThemself
      | OnboardingUserUploadedPhotoOfFamily
    >(
      [
        'UserUploadedPhotoToChat',
        'UserUploadedPhotoToFamily',
        'UserInsertedPhotoInRichTextThread',
        'OnboardingUserUploadedPhotoOfFamily',
        'OnboardingUserUploadedPhotoOfThemself',
      ],
      {
        familyId: familyId || userId,
      }
    ))
  )

  if (!familyId || familyId === asFamilyId(userId)) {
    // Look for photos from the user
    photos.push(
      ...(await getEventList<UserUploadedPhoto>(['UserUploadedPhoto'], {
        userId,
      }))
    )
  } else {
    // Look for shared photos
    const sharedPhotos = await getEventList<PhotoAutoSharedWithThread>('PhotoAutoSharedWithThread', { familyId })

    photos.push(...sharedPhotos)
  }

  const nonDeletedPhotos = []
  for (const photoEvent of photos) {
    if (await isPhotoDeleted(photoEvent.payload.photoId)) continue
    // if (await isPhotoCloned(photoEvent.payload.photoId)) continue
    nonDeletedPhotos.push(photoEvent)
  }

  return {
    photos: nonDeletedPhotos.map(({ payload: { photoId } }) => ({
      photoId,
    })),
    currentFamilyId: familyId || asFamilyId(userId),
  }
}
