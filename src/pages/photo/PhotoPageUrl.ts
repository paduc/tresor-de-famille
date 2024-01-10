import { PhotoId } from '../../domain/PhotoId'

export const PhotoPageUrl = (photoId: PhotoId | ':photoId') => `/photo/${photoId}/photo.html`
