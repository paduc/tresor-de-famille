import { AppUserId } from '../domain/AppUserId.js'
import { FamilyId } from '../domain/FamilyId.js'
import { PhotoId } from '../domain/PhotoId.js'
import { getPhotoEvents } from './_getPhotoEvents.js'

export async function getPhotoAuthor(photoId: PhotoId): Promise<AppUserId | undefined> {
  const photoEvents = await getPhotoEvents(photoId)
  // @ts-ignore
  return photoEvents.at(0)?.payload.userId
}
