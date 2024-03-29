import { getEventList } from '../../dependencies/getEventList.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { PhotoEvent } from '../_getPhotoEvents.js'
import { isPhotoDeleted } from '../_isPhotoDeleted.js'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from '../photoApi/UserUploadedPhotoToFamily.js'
import { PhotoAutoSharedWithThread } from '../thread/PhotoAutoSharedWithThread.js'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'
import { PhotoListProps } from './PhotoListPage.js'

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
