import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { isPhotoDeleted } from '../_isPhotoDeleted'
import { PhotoClonedForSharing } from '../thread/ThreadPage/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoListProps } from './PhotoListPage'

type GetPhotoListPageProsArgs = {
  familyId: FamilyId
  userId: AppUserId
}

export const getPhotoListPageProps = async ({ userId, familyId }: GetPhotoListPageProsArgs): Promise<PhotoListProps> => {
  const uploadedPhotos = await getEventList<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
  >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], {
    uploadedBy: userId,
    familyId,
  })

  const insertedPhotos = await getEventList<UserInsertedPhotoInRichTextThread>('UserInsertedPhotoInRichTextThread', {
    userId,
    familyId,
  })

  const photoList = [...uploadedPhotos, ...insertedPhotos]

  const photos = []

  for (const photoEvent of photoList) {
    if (await isPhotoDeleted(photoEvent.payload.photoId)) continue
    // if (await isPhotoCloned(photoEvent.payload.photoId)) continue
    photos.push(photoEvent)
  }

  return {
    photos: photos.map(({ payload: { photoId } }) => ({
      photoId,
      url: getPhotoUrlFromId(photoId),
    })),
    currentFamilyId: familyId,
  }
}

/**
 * Tells if a photo has a cloned version
 */
async function isPhotoCloned(photoId: PhotoId) {
  const { rows } = await postgres.query<PhotoClonedForSharing>(
    `SELECT * FROM history WHERE type='PhotoClonedForSharing' AND payload->'clonedFrom'->>'photoId'=$1 LIMIT 1`,
    [photoId]
  )

  return !!rows.length
}
