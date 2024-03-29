import { PhotoId } from '../../domain/PhotoId.js'

export const ThumbnailURL = (photoId: PhotoId | ':photoId') => `/thumbnail/${photoId}`
