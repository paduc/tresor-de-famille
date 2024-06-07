import { PhotoId } from '../../domain/PhotoId.js'

export const PhotoURL = (photoId: PhotoId | ':photoId') => `/photos/${photoId}.jpg`
