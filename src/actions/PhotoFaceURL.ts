import { PhotoId } from '../domain/PhotoId.js'
import { FaceId } from '../domain/FaceId.js'

export const PhotoFaceURL = (args?: { photoId: PhotoId; faceId: FaceId }) => {
  if (args) {
    const { photoId, faceId } = args
    return `/photo/${photoId}/face/${faceId}`
  }
  return '/photo/:photoId/face/:faceId'
}
