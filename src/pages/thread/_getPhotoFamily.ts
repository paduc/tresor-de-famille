import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { PhotoClonedForSharing } from './ThreadPage/PhotoClonedForSharing'
import { getPhotoEvents } from './_getPhotoEvents'

export async function getPhotoFamily(photoId: PhotoId): Promise<FamilyId | null> {
  const photoEvents = await getPhotoEvents(photoId)

  if (!photoEvents.length) return null

  // If there is a cloned event, it gives us the family
  const cloneEvent = photoEvents.find((e): e is PhotoClonedForSharing => e.type === 'PhotoClonedForSharing')
  if (cloneEvent) return cloneEvent.payload.familyId

  const creationEvent = photoEvents.at(0)
  if (!creationEvent) return null

  // If not cloned, the familyId is the userId
  switch (creationEvent.type) {
    case 'OnboardingUserUploadedPhotoOfFamily':
    case 'OnboardingUserUploadedPhotoOfThemself':
      return creationEvent.payload.uploadedBy as string as FamilyId
    case 'PhotoClonedForSharing':
    case 'UserDeletedPhoto':
    case 'UserInsertedPhotoInRichTextThread':
      return creationEvent.payload.userId as string as FamilyId
    case 'UserAddedCaptionToPhoto':
      return creationEvent.payload.addedBy as string as FamilyId
    case 'UserUploadedPhotoToChat':
      return creationEvent.payload.uploadedBy as string as FamilyId
  }
}
