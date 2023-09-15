import { postgres } from '../dependencies/database'
import { getEventList } from '../dependencies/getEventList'
import { UUID } from '../domain'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from './photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'

export const getPersonIdsForFaceIdOld = async (faceId: UUID): Promise<UUID[]> => {
  const { rows } = await postgres.query<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | UserConfirmedHisFace
    | UserNamedPersonInPhoto
    | UserRecognizedPersonInPhoto
  >(
    "SELECT * FROM history WHERE type IN ('PhotoAnnotationConfirmed','PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto') AND payload->>'faceId'=$1",
    [faceId]
  )

  return Array.from(new Set(rows.map((row) => row.payload.personId)))
}

export const getPersonIdsForFaceId = async (faceId: UUID): Promise<UUID[]> => {
  const annotationEvents = await getEventList<
    | PhotoAnnotationConfirmed
    | PhotoManuallyAnnotated
    | UserConfirmedHisFace
    | UserNamedPersonInPhoto
    | UserRecognizedPersonInPhoto
  >(
    [
      'PhotoAnnotationConfirmed',
      'PhotoManuallyAnnotated',
      'UserConfirmedHisFace',
      'UserNamedPersonInPhoto',
      'UserRecognizedPersonInPhoto',
    ],
    { faceId }
  )

  type PhotoId = UUID
  type PersonId = UUID

  const uniqueByPhotoId = new Map<PhotoId, PersonId>()
  for (const annotationEvent of annotationEvents) {
    const { photoId, personId } = annotationEvent.payload
    uniqueByPhotoId.set(photoId, personId)
  }

  // Count how many photos of each person for this face (so the first 'try' is more probably the best)
  const countByPersonId = new Map<PersonId, number>()
  for (const personId of uniqueByPhotoId.values()) {
    countByPersonId.set(personId, (countByPersonId.get(personId) || 0) + 1)
  }
  const personIdsSortedByPhotoCount = Array.from(countByPersonId.entries()).sort(([_, countA], [__, countB]) => countB - countA)

  return personIdsSortedByPhotoCount.map(([personId, _]) => personId)
}
