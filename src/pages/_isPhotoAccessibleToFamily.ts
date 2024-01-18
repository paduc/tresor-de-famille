import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { getPhotoEvents } from './_getPhotoEvents'

export const isPhotoAccessibleToFamily = async ({
  photoId,
  familyId,
}: {
  photoId: PhotoId
  familyId: FamilyId
}): Promise<boolean> => {
  const photoEvents = await getPhotoEvents(photoId)

  for (const photoEvent of photoEvents) {
    switch (photoEvent.type) {
      case 'OnboardingUserUploadedPhotoOfFamily':
      case 'OnboardingUserUploadedPhotoOfThemself':
      case 'UserInsertedPhotoInRichTextThread':
      case 'UserUploadedPhotoToChat':
      case 'UserUploadedPhotoToFamily':
      case 'PhotoAutoSharedWithThread':
        if (photoEvent.payload.familyId === familyId) return true
        break
      case 'UserUploadedPhoto':
        if ((photoEvent.payload.userId as unknown as FamilyId) === familyId) return true
        break
    }
  }

  return false
}
