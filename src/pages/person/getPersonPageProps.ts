import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { getPersonById } from '../_getPersonById'

import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'
import { UserDeletedPhoto } from '../photo/UserDeletedPhoto'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { PersonPageProps } from './PersonPage'
import { FamilyId } from '../../domain/FamilyId'

export const getPersonPageProps = async ({
  personId,
  userId,
  familyId,
}: {
  personId: PersonId
  userId: AppUserId
  familyId: FamilyId
}): Promise<PersonPageProps> => {
  const { photos, alternateProfilePics } = await getPersonPhotos(personId, userId)

  const { name } = (await getPersonById({ personId, familyId })) || { name: 'N/A' }

  const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId, familyId })

  return {
    person: { personId, name, profilePicUrl },
    photos,
    alternateProfilePics,
  }
}
async function getPersonPhotos(personId: PersonId, userId: AppUserId) {
  const photoEvents = await getEventList<
    PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
  >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
    personId,
  })

  const deletedPhotosEvents = await getEventList<UserDeletedPhoto>('UserDeletedPhoto', { userId })
  const deletedPhotoIds = deletedPhotosEvents.map((deletionEvent) => deletionEvent.payload.photoId)

  const nonDeletedPhotos = photoEvents.filter((photoEvent) => !deletedPhotoIds.includes(photoEvent.payload.photoId))

  const photoIdsFromPhotoEvents = nonDeletedPhotos.map((event) => event.payload.photoId)

  const uniqueFaceIds = new Set<FaceId>(nonDeletedPhotos.map((event) => event.payload.faceId))

  const awsDetectionsOfAtLeastOneFace = (
    await postgres.query<{ photoId: PhotoId; faces: { faceId: FaceId }[] }>(
      "SELECT payload->>'photoId' AS \"photoId\", payload->'faces' AS faces from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
      [Array.from(uniqueFaceIds)]
    )
  ).rows

  const photoIdsFromPhotosWithSameFaces = awsDetectionsOfAtLeastOneFace.map(({ photoId }) => photoId)

  const photoIds = Array.from(new Set<PhotoId>([...photoIdsFromPhotoEvents, ...photoIdsFromPhotosWithSameFaces]))

  // TODO (later): remove the photos for which another person was tagged for this faceId

  const alternateProfilePics: {
    faceId: FaceId
    photoId: PhotoId
    url: string
  }[] = []

  for (const { photoId, faces } of awsDetectionsOfAtLeastOneFace) {
    const face = faces.find((face) => uniqueFaceIds.has(face.faceId))
    if (face) {
      const { faceId } = face
      alternateProfilePics.push({ faceId, photoId, url: `/photo/${photoId}/face/${faceId}` })
    }
  }

  return {
    photos: photoIds.map((photoId) => ({ photoId, url: getPhotoUrlFromId(photoId) })),
    alternateProfilePics,
  }
}
