import { getEventList } from '../dependencies/getEventList'
import { AppUserId } from '../domain/AppUserId'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'

export const getPersonIdsForFaceId = async ({
  faceId,
  userId,
  familyId,
}: {
  faceId: FaceId
  userId: AppUserId
  familyId: FamilyId
}): Promise<PersonId[]> => {
  const annotationEvents = (
    await getEventList<PhotoManuallyAnnotated | UserConfirmedHisFace | UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
      ['PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
      { faceId, familyId }
    )
  ).filter((event) => {
    // Only keep user events
    // (could have been done in the query but the userId is in different payload fields)
    switch (event.type) {
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
