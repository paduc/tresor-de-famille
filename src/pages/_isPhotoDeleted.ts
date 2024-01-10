import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { UserDeletedPhoto } from './photoApi/UserDeletedPhoto'

export async function isPhotoDeleted(photoId: PhotoId) {
  const isDeleted = await getSingleEvent<UserDeletedPhoto>('UserDeletedPhoto', { photoId })

  return !!isDeleted
}
