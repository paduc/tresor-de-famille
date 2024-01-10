import { PhotoId } from '../../domain/PhotoId'

export const PhotoURL = (photoId: PhotoId | ':photoId') => `/photos/${photoId}`
