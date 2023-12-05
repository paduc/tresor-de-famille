import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { UserAddedCaptionToPhoto } from './photo/UserAddedCaptionToPhoto'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

export async function getPhotoCaption({ photoId }: { photoId: PhotoId }) {
  const captionEvent = await getSingleEvent<UserAddedCaptionToPhoto | PhotoClonedForSharing>(
    ['UserAddedCaptionToPhoto', 'PhotoClonedForSharing'],
    { photoId }
  )

  if (captionEvent) {
    if (captionEvent.type === 'UserAddedCaptionToPhoto') {
      return captionEvent.payload.caption.body
    }

    if (captionEvent.type === 'PhotoClonedForSharing') {
      return captionEvent.payload.caption || ''
    }
  }

  return ''
}
