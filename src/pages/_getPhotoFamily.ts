import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { getPhotoEvents } from './_getPhotoEvents'

export async function getPhotoFamilyId(photoId: PhotoId): Promise<FamilyId> {
  const photoEvents = await getPhotoEvents(photoId)

  if (!photoEvents.length) {
    throw new Error('Cannot get family because photo does not exist')
  }

  const creationEvent = photoEvents.at(0)!

  switch (creationEvent.type) {
    case 'OnboardingUserUploadedPhotoOfFamily':
    case 'OnboardingUserUploadedPhotoOfThemself':
    case 'UserInsertedPhotoInRichTextThread':
    case 'UserUploadedPhotoToChat':
    case 'UserUploadedPhotoToFamily':
    case 'PhotoAutoSharedWithThread':
      return creationEvent.payload.familyId
    case 'UserUploadedPhoto':
      return creationEvent.payload.userId as unknown as FamilyId
    case 'UserDeletedPhoto':
    case 'UserAddedCaptionToPhoto':
      throw new Error('First event for this photo is not possible')
  }
}
