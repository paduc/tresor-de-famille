import { PhotoId } from '../../domain/PhotoId'

export const PhotoPageUrl = (photoId: PhotoId | ':photoId') => {
  return `/photo/${photoId}/photo.html`
}
