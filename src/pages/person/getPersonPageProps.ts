import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { getPersonById } from '../_getPersonById'

import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from '../photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { PersonPageProps } from './PersonPage'
import { UserDeletedPhoto } from '../photo/UserDeletedPhoto'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'

export const getPersonPageProps = async (personId: UUID, userId: UUID): Promise<PersonPageProps> => {
  const { photos, alternateProfilePics } = await getPersonPhotos(personId, userId)

  const { name } = (await getPersonById(personId)) || { name: 'N/A' }

  const profilePicUrl = await getProfilePicUrlForPerson(personId, userId)

  return {
    person: { personId, name, profilePicUrl },
    photos,
    alternateProfilePics,
  }
}
async function getPersonPhotos(personId: UUID, userId: UUID) {
  const photoEvents = await getEventList<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | UserRecognizedPersonInPhoto
    | UserNamedPersonInPhoto
    | UserConfirmedHisFace
  >(
    [
      'PhotoAnnotationConfirmed',
      'PhotoManuallyAnnotated',
      'UserRecognizedPersonInPhoto',
      'UserNamedPersonInPhoto',
      'UserConfirmedHisFace',
    ],
    {
      personId,
    }
  )

  const deletedPhotosEvents = await getEventList<UserDeletedPhoto>('UserDeletedPhoto', { userId })
  const deletedPhotoIds = deletedPhotosEvents.map((deletionEvent) => deletionEvent.payload.photoId)

  const nonDeletedPhotos = photoEvents.filter((photoEvent) => !deletedPhotoIds.includes(photoEvent.payload.photoId))

  const photoIdsFromPhotoEvents = nonDeletedPhotos.map((event) => event.payload.photoId)

  const uniqueFaceIds = new Set<UUID>(nonDeletedPhotos.map((event) => event.payload.faceId))

  const awsDetectionsOfAtLeastOneFace = (
    await postgres.query<{ photoId: UUID; faces: { faceId: UUID }[] }>(
      "SELECT payload->>'photoId' AS \"photoId\", payload->'faces' AS faces from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
      [Array.from(uniqueFaceIds)]
    )
  ).rows

  const photoIdsFromPhotosWithSameFaces = awsDetectionsOfAtLeastOneFace.map(({ photoId }) => photoId)

  const photoIds = Array.from(new Set<UUID>([...photoIdsFromPhotoEvents, ...photoIdsFromPhotosWithSameFaces]))

  // TODO (later): remove the photos for which another person was tagged for this faceId

  const alternateProfilePics: {
    faceId: UUID
    photoId: UUID
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
