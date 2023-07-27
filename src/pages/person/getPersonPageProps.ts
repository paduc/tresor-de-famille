import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonById } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { UserNamedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'
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
    PhotoAnnotationConfirmed | PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto
  >(['PhotoAnnotationConfirmed', 'PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto'], {
    personId,
  })

  const uniqueFaceIds = new Set<UUID>(photoEvents.map((event) => event.payload.faceId))

  // TODO: get photos where faceId has been detected (postgresql AWSDetectedFacesInPhoto where payload->faces includes one or more items of uniqueFaceIds)

  // TODO (later): remove the photos for which another person was tagged for this faceId

  const photos = photoEvents.map(({ payload: { photoId } }) => ({ id: photoId, url: getPhotoUrlFromId(photoId) }))
  return photos
}
