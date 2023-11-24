import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { UserAddedCaptionToPhoto } from './photo/UserAddedCaptionToPhoto'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

export async function getPhotoCaption({ photoId, familyId }: { photoId: PhotoId; familyId: FamilyId }) {
  const captionEvent = await getSingleEvent<UserAddedCaptionToPhoto | PhotoClonedForSharing>(
    ['UserAddedCaptionToPhoto', 'PhotoClonedForSharing'],
    { photoId, familyId }
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
