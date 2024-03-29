import { requireAuth } from '../../dependencies/authn.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily.js'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { PhotoEvent } from '../_getPhotoEvents.js'
import { getUserFamilies } from '../_getUserFamilies.js'
import { isPhotoDeleted } from '../_isPhotoDeleted.js'
import { pageRouter } from '../pageRouter.js'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread.js'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat.js'
import { MediaSelectorListURL } from './MediaSelectorListURL.js'
import { UserUploadedPhoto } from './UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './UserUploadedPhotoToFamily.js'

/**
 * This route is called by the media selector component
 * It returns a list of all the photos the user has access to
 */
pageRouter.route(MediaSelectorListURL()).get(requireAuth(), async (request, response, next) => {
  try {
    const userId = request.session.user!.id

    const userFamilies = await getUserFamilies(userId)
    const photos = []
    for (const { familyId } of userFamilies) {
      const familyPhotos = await getFamilyPhotos({ familyId, userId })
      photos.push(...familyPhotos)
    }

    const nonClonedPhotos = []
    for (const photo of photos) {
      // Remove photos that are clones from another photo in the list
      if (!photo.clonedFrom || !photos.some((p) => p.photoId === photo.clonedFrom)) {
        nonClonedPhotos.push(photo)
      }
    }

    const sortedUniquePhotos = new Set(
      nonClonedPhotos.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).map((item) => item.photoId)
    )

    return response.json({ photos: Array.from(sortedUniquePhotos) })
  } catch (error) {
    console.error('getListForMediaSelector', error)
    next(error)
  }
})

async function getFamilyPhotos({ familyId, userId }: { userId: AppUserId; familyId: FamilyId }): Promise<
  {
    photoId: PhotoId
    clonedFrom?: PhotoId
    occurredAt: Date
  }[]
> {
  const photos: PhotoEvent[] = []

  photos.push(
    ...(await getEventList<
      | UserUploadedPhotoToChat
      | UserUploadedPhotoToFamily
      | UserInsertedPhotoInRichTextThread
      | OnboardingUserUploadedPhotoOfThemself
      | OnboardingUserUploadedPhotoOfFamily
    >(
      [
        'UserUploadedPhotoToChat',
        'UserUploadedPhotoToFamily',
        'UserInsertedPhotoInRichTextThread',
        'OnboardingUserUploadedPhotoOfFamily',
        'OnboardingUserUploadedPhotoOfThemself',
      ],
      {
        familyId: familyId || userId,
      }
    ))
  )

  if (!familyId || familyId === asFamilyId(userId)) {
    photos.push(
      ...(await getEventList<UserUploadedPhoto>(['UserUploadedPhoto'], {
        userId,
      }))
    )
  }

  const nonDeletedPhotos = []
  for (const photoEvent of photos) {
    if (await isPhotoDeleted(photoEvent.payload.photoId)) continue
    // if (await isPhotoCloned(photoEvent.payload.photoId)) continue
    nonDeletedPhotos.push(photoEvent)
  }

  return nonDeletedPhotos.map(({ type, payload, occurredAt }) => {
    return {
      photoId: payload.photoId,
      occurredAt,
    }
  })
}
