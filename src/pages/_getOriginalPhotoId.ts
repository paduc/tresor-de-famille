import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

/**
 * For a PhotoId, descend the clone tree until we reach the original photoId
 * @param photoId the current photoId
 * @returns the first photoId that was cloned
 */
export async function getOriginalPhotoId(photoId: PhotoId): Promise<PhotoId> {
  const isPhotoCloned = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })

  if (isPhotoCloned) {
    return getOriginalPhotoId(isPhotoCloned.payload.clonedFrom.photoId)
  }

  return photoId
}
