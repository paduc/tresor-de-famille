import { AppUserId } from '../domain/AppUserId.js'
import { PhotoId } from '../domain/PhotoId.js'
import { asFamilyId } from '../libs/typeguards.js'
import { getPhotoEvents } from './_getPhotoEvents.js'
import { getUserFamilies } from './_getUserFamilies.js'

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
