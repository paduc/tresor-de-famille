import { PhotoId } from '../domain/PhotoId'

export const ThumbnailURL = (photoId?: PhotoId) => {
  if (!photoId) {
    return '/thumbnail/:photoId'
  }

  return `/thumbnail/${photoId}`
}
