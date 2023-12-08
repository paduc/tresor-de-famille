import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { FaceIgnoredInPhoto } from '../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { getOriginalPhotoId } from './_getOriginalPhotoId'
import { AWSDetectedFacesInPhoto } from './photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'
import { getPhotoFamilyId } from './_getPhotoFamily'
import { PersonId } from '../domain/PersonId'
import { getEventList } from '../dependencies/getEventList'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { getPersonFamily } from './_getPersonFamily'
import { PhotoManuallyAnnotated } from './photo/annotateManually/PhotoManuallyAnnotated'
import { getPersonClones } from './_getPersonClones'

export async function getFacesInPhoto({ photoId }: { photoId: PhotoId }): Promise<FaceInfoForPhotoInFamily[]> {
  const originalPhotoId = await getOriginalPhotoId(photoId)

  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId: originalPhotoId,
  })

  const awsDetectedFaces = awsFacesDetectedEvent?.payload.faces || []

  const detectedFaceIds = awsDetectedFaces.map((awsFace) => awsFace.faceId)

  const photoFamilyId = await getPhotoFamilyId(photoId)

  return Promise.all(
    detectedFaceIds.map((faceId) =>
      getFaceInfoForPhotoInFamily({
        faceId,
        photoId,
        familyId: photoFamilyId,
      })
    )
  )
}

type FaceInfoForPhotoInFamily = { faceId: FaceId; personId?: PersonId | undefined; isIgnored?: boolean | undefined }

async function getFaceInfoForPhotoInFamily({
  faceId,
  photoId,
  familyId,
}: {
  faceId: FaceId
  photoId: PhotoId
  familyId: FamilyId
}): Promise<FaceInfoForPhotoInFamily> {
  // 1) Look for latest face events on this photoId (ie in this family)
  const personNamedOrRecognizedEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
    }
  )

  const faceIgnoredEvent = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    faceId,
    photoId,
  })

  type Defined = Exclude<typeof personNamedOrRecognizedEvent | typeof faceIgnoredEvent, undefined>

  const latestEvent = [personNamedOrRecognizedEvent, faceIgnoredEvent]
    .filter((event): event is Defined => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .at(-1)

  if (latestEvent) {
    switch (latestEvent.type) {
      case 'FaceIgnoredInPhoto':
        return { faceId, isIgnored: true }
      case 'UserRecognizedPersonInPhoto':
      case 'UserNamedPersonInPhoto':
        return { faceId, personId: latestEvent.payload.personId }
    }
  }

  // 2) If there are none and the photo is a clone, look for persons associated to this face in the PhotoCloned event

  const photoClonedEvent = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })
  if (photoClonedEvent) {
    const faceInfoInCloneEvent = photoClonedEvent.payload.faces.find((face) => face.faceId === faceId)
    if (faceInfoInCloneEvent) return faceInfoInCloneEvent
  }

  // 3) Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsInFamilyForFaceId({ faceId, familyId })
  if (persons.length) {
    const personId = persons[0]

    if (personId) {
      return {
        faceId,
        personId,
      }
    }
  }

  return { faceId }
}

const getPersonIdsInFamilyForFaceId = async ({
  faceId,
  familyId,
}: {
  faceId: FaceId
  familyId: FamilyId
}): Promise<PersonId[]> => {
  // 1) Get all personIds linked to this faceId (all families)
  // NB: PhotoCloned events have only a duplicate of these links and can be ignored
  const eventsWithFaceId = await getEventList<
    PhotoManuallyAnnotated | UserConfirmedHisFace | UserNamedPersonInPhoto | UserRecognizedPersonInPhoto
  >(['PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'], {
    faceId,
  })

  // 2) For each unique personId in the previous results,
  const uniquePersonIds = new Map<PersonId, number>()
  for (const event of eventsWithFaceId) {
    const personId = event.payload.personId
    uniquePersonIds.set(personId, (uniquePersonIds.get(personId) || 0) + 1)
  }

  // 2.1) get all clones
  const results = new Set<PersonId>()
  for (const personId of uniquePersonIds.keys()) {
    // 2.2) filter for family
    // Let's say there is only one clone per person per family
    const cloneInFamily = (await getPersonClones({ personId })).find((clone) => clone.familyId === familyId)?.personId

    if (cloneInFamily) {
      results.add(cloneInFamily)
    }
  }

  // Return the personId with the most photos
  if (results.size === 0) return []

  return Array.from(results).sort((a, b) => uniquePersonIds.get(b)! - uniquePersonIds.get(a)!)

  // // OLD VERSION

  // const annotationEvents: (
  //   | PhotoManuallyAnnotated
  //   | UserConfirmedHisFace
  //   | UserNamedPersonInPhoto
  //   | UserRecognizedPersonInPhoto
  //   | PhotoClonedForSharing
  // )[] = []

  // annotationEvents.push(
  //   ...(await getEventList<
  //     PhotoManuallyAnnotated | UserConfirmedHisFace | UserNamedPersonInPhoto | UserRecognizedPersonInPhoto
  //   >(['PhotoManuallyAnnotated', 'UserConfirmedHisFace', 'UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'], {
  //     faceId,
  //   }))
  // )

  // annotationEvents.push(
  //   ...(await getEventList<PhotoClonedForSharing>('PhotoClonedForSharing', { familyId })).filter((event) =>
  //     event.payload.faces.map((face) => face.faceId).includes(faceId)
  //   )
  // )

  // const uniqueByPhotoId = new Map<PhotoId, PersonId>()
  // for (const annotationEvent of annotationEvents) {
  //   const { photoId } = annotationEvent.payload
  //   const personId =
  //     annotationEvent.type === 'PhotoClonedForSharing'
  //       ? annotationEvent.payload.faces.find((face) => face.faceId === faceId)?.personId
  //       : annotationEvent.payload.personId

  //   if (personId) {
  //     // Filter by familyId
  //     const personFamily = await getPersonFamily(personId)
  //     if (personFamily && personFamily === familyId) {
  //       uniqueByPhotoId.set(photoId, personId)
  //     }
  //   }
  // }

  // // Count how many photos of each person for this face (so the first 'try' is more probably the best)
  // const countByPersonId = new Map<PersonId, number>()
  // for (const personId of uniqueByPhotoId.values()) {
  //   countByPersonId.set(personId, (countByPersonId.get(personId) || 0) + 1)
  // }
  // const personIdsSortedByPhotoCount = Array.from(countByPersonId.entries()).sort(([_, countA], [__, countB]) => countB - countA)

  // return personIdsSortedByPhotoCount.map(([personId, _]) => personId)
}
