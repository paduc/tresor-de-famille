import { postgres } from '../../dependencies/database'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonById } from '../_getPersonById'
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
  const { rows } = await postgres.query<PhotoAnnotationConfirmed | PhotoManuallyAnnotated>(
    "SELECT * FROM history WHERE type IN ('PhotoAnnotationConfirmed','PhotoManuallyAnnotated') AND payload->>'personId'=$1",
    [personId]
  )

  const photos = rows.map(({ payload: { photoId } }) => ({ id: photoId, url: getPhotoUrlFromId(photoId) }))
  return photos
}
