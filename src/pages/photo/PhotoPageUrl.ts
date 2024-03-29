import { PhotoId } from '../../domain/PhotoId.js'

export const PhotoPageUrl = (photoId: PhotoId | ':photoId') => {
  return `/photo/${photoId}/photo.html`
}
