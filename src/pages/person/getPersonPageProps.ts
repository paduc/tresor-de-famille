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

export const getPersonPageProps = async (personId: UUID): Promise<PersonPageProps> => {
  const photos = await getPersonPhotos(personId)

  const { name } = (await getPersonById(personId)) || { name: 'N/A' }

  return {
    person: { name },
    photos,
  }
}
async function getPersonPhotos(personId: UUID) {
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

  const photoIdsFromPhotoEvents = photoEvents.map((event) => event.payload.photoId)

  const uniqueFaceIds = new Set<UUID>(photoEvents.map((event) => event.payload.faceId))

  const photoIdsFromPhotosWithSameFaces = (
    await postgres.query<{ photo_id: UUID }>(
      "SELECT payload->>'photoId' AS photo_id from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
      [Array.from(uniqueFaceIds)]
    )
  ).rows.map(({ photo_id }) => photo_id)

  const photoIds = Array.from(new Set<UUID>([...photoIdsFromPhotoEvents, ...photoIdsFromPhotosWithSameFaces]))

  // TODO (later): remove the photos for which another person was tagged for this faceId

  return photoIds.map((photoId) => ({ id: photoId, url: getPhotoUrlFromId(photoId) }))
}
