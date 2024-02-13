import { AppUserId } from '../domain/AppUserId'
import { PhotoId } from '../domain/PhotoId'
import { asFamilyId } from '../libs/typeguards'
import { getPhotoEvents } from './_getPhotoEvents'
import { getUserFamilies } from './_getUserFamilies'

export const isPhotoAccessibleToUser = async ({
  photoId,
  userId,
}: {
  photoId: PhotoId
  userId: AppUserId
}): Promise<boolean> => {
  const photoEvents = await getPhotoEvents(photoId)

  if (!photoEvents.length) return false

  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)
  for (const photoEvent of photoEvents) {
    switch (photoEvent.type) {
      case 'OnboardingUserUploadedPhotoOfFamily':
      case 'OnboardingUserUploadedPhotoOfThemself':
      case 'UserInsertedPhotoInRichTextThread':
      case 'UserUploadedPhotoToChat':
      case 'UserUploadedPhotoToFamily':
      case 'PhotoAutoSharedWithThread':
        if (userFamilyIds.includes(photoEvent.payload.familyId)) {
          return true
        }
        break
      case 'UserUploadedPhoto':
        if (userFamilyIds.includes(asFamilyId(photoEvent.payload.userId))) {
          return true
        }
        break
    }
  }

  return false
}
