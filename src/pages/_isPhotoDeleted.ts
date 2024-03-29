import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { PhotoId } from '../domain/PhotoId.js'
import { UserDeletedPhoto } from './photoApi/UserDeletedPhoto.js'

export async function isPhotoDeleted(photoId: PhotoId) {
  const isDeleted = await getSingleEvent<UserDeletedPhoto>('UserDeletedPhoto', { photoId })

  return !!isDeleted
}
