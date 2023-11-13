import { postgres } from '../dependencies/database'
import { getEventList } from '../dependencies/getEventList'
import { AppUserId } from '../domain/AppUserId'
import { FaceId } from '../domain/FaceId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotationConfirmed } from './photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed'

export const getPersonIdsForFaceIdOld = async (faceId: FaceId): Promise<PersonId[]> => {
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

export const getPersonIdsForFaceId = async ({ faceId, userId }: { faceId: FaceId; userId: AppUserId }): Promise<PersonId[]> => {
  const annotationEvents = (
    await getEventList<
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
  ).filter((event) => {
    // Only keep user events
    // (could have been done in the query but the userId is in different payload fields)
    switch (event.type) {
      case 'PhotoAnnotationConfirmed':
        return event.payload.confirmedBy === userId
      case 'PhotoManuallyAnnotated':
        return event.payload.annotatedBy === userId
      default:
        return event.payload.userId === userId
    }
  })

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
