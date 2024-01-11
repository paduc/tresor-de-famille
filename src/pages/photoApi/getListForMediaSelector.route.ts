import { requireAuth } from '../../dependencies/authn'
import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { OnboardingUserUploadedPhotoOfFamily } from '../../events/onboarding/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserUploadedPhotoOfThemself } from '../../events/onboarding/OnboardingUserUploadedPhotoOfThemself'
import { asFamilyId } from '../../libs/typeguards'
import { PhotoEvent } from '../_getPhotoEvents'
import { getUserFamilies } from '../_getUserFamilies'
import { isPhotoDeleted } from '../_isPhotoDeleted'
import { pageRouter } from '../pageRouter'
import { PhotoClonedForSharing } from '../thread/ThreadPage/PhotoClonedForSharing'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread'
import { UserUploadedPhotoToChat } from '../thread/uploadPhotoToChat/UserUploadedPhotoToChat'
import { MediaSelectorListURL } from './MediaSelectorListURL'
import { UserUploadedPhoto } from './UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './UserUploadedPhotoToFamily'

/**
 * This route is called by the media selector component
 * It returns a list of all the photos the user has access to
 */
pageRouter.route(MediaSelectorListURL()).get(requireAuth(), async (request, response) => {
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
    response.status(500).send()
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
      | PhotoClonedForSharing
      | UserUploadedPhotoToChat
      | UserUploadedPhotoToFamily
      | UserInsertedPhotoInRichTextThread
      | OnboardingUserUploadedPhotoOfThemself
      | OnboardingUserUploadedPhotoOfFamily
    >(
      [
        'PhotoClonedForSharing',
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
    if (type === 'PhotoClonedForSharing') {
      return {
        photoId: payload.photoId,
        clonedFrom: payload.clonedFrom.photoId,
        occurredAt,
      }
    }

    return {
      photoId: payload.photoId,
      occurredAt,
    }
  })
}
