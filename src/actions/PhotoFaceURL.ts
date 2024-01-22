import { PhotoId } from '../domain/PhotoId'
import { FaceId } from '../domain/FaceId'

export const PhotoFaceURL = (args?: { photoId: PhotoId; faceId: FaceId }) => {
  if (args) {
    const { photoId, faceId } = args
    return `/photo/${photoId}/face/${faceId}`
  }
  return '/photo/:photoId/face/:faceId'
}
