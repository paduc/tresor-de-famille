import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { UserAddedCaptionToPhoto } from './photo/UserAddedCaptionToPhoto'

export async function getPhotoCaption({ photoId }: { photoId: PhotoId }) {
  const captionEvent = await getSingleEvent<UserAddedCaptionToPhoto>(['UserAddedCaptionToPhoto'], { photoId })

  if (captionEvent) {
    return captionEvent.payload.caption.body
  }

  return ''
}
