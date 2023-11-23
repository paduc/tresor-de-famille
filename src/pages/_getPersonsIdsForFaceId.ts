import { getEventList } from '../dependencies/getEventList'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

export const getPersonIdsForFaceId = async ({
  faceId,
  familyId,
}: {
  faceId: FaceId
  familyId: FamilyId
}): Promise<PersonId[]> => {
  const annotationEvents: (
    | PhotoManuallyAnnotated
    | UserConfirmedHisFace
    | UserNamedPersonInPhoto
    | UserRecognizedPersonInPhoto
    | PhotoClonedForSharing
  )[] = []

  annotationEvents.push(
    ...(await getEventList<
      PhotoManuallyAnnotated | UserConfirmedHisFace | UserNamedPersonInPhoto | UserRecognizedPersonInPhoto
    >(['PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'], {
      faceId,
      familyId,
    }))
  )

  annotationEvents.push(
    ...(await getEventList<PhotoClonedForSharing>('PhotoClonedForSharing', { familyId })).filter((event) =>
      event.payload.faces.map((face) => face.faceId).includes(faceId)
    )
  )

  const uniqueByPhotoId = new Map<PhotoId, PersonId>()
  for (const annotationEvent of annotationEvents) {
    const { photoId } = annotationEvent.payload
    const personId =
      annotationEvent.type === 'PhotoClonedForSharing'
        ? annotationEvent.payload.faces.find((face) => face.faceId === faceId)?.personId
        : annotationEvent.payload.personId

    if (personId) {
      uniqueByPhotoId.set(photoId, personId)
    }
  }

  // Count how many photos of each person for this face (so the first 'try' is more probably the best)
  const countByPersonId = new Map<PersonId, number>()
  for (const personId of uniqueByPhotoId.values()) {
    countByPersonId.set(personId, (countByPersonId.get(personId) || 0) + 1)
  }
  const personIdsSortedByPhotoCount = Array.from(countByPersonId.entries()).sort(([_, countA], [__, countB]) => countB - countA)

  return personIdsSortedByPhotoCount.map(([personId, _]) => personId)
}
