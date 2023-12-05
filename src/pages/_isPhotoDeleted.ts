import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { UserDeletedPhoto } from './photo/UserDeletedPhoto'

export async function isPhotoDeleted(photoId: PhotoId) {
  const isDeleted = await getSingleEvent<UserDeletedPhoto>('UserDeletedPhoto', { photoId })

  return !!isDeleted
}
