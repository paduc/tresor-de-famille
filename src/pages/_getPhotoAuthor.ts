import { AppUserId } from '../domain/AppUserId'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { getPhotoEvents } from './_getPhotoEvents'

export async function getPhotoAuthor(photoId: PhotoId): Promise<AppUserId | undefined> {
  const photoEvents = await getPhotoEvents(photoId)
  // @ts-ignore
  return photoEvents.at(0)?.payload.userId
}
