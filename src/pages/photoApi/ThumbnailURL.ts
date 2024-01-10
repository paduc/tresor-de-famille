import { PhotoId } from '../../domain/PhotoId'

export const ThumbnailURL = (photoId: PhotoId | ':photoId') => `/thumbnail/${photoId}`
