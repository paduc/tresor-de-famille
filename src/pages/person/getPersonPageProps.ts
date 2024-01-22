import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { getPersonById } from '../_getPersonById'

import { PhotoFaceURL } from '../../actions/PhotoFaceURL'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'
import { isPhotoAccessibleToUser } from '../_isPhotoAccessibleToUser'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { UserDeletedPhoto } from '../photoApi/UserDeletedPhoto'
import { PersonPageProps } from './PersonPage'

export const getPersonPageProps = async ({
  personId,
  userId,
}: {
  personId: PersonId
  userId: AppUserId
}): Promise<PersonPageProps> => {
  const { name } = (await getPersonById({ personId })) || { name: 'N/A' }
  const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })

  const photoIds = new Set<PhotoId>()
  const profilePhotoAndFace = new Map<PhotoId, Set<FaceId>>()

  function addProfilePhotoFace(photoId: PhotoId, faceId: FaceId) {
    if (!profilePhotoAndFace.has(photoId)) {
      profilePhotoAndFace.set(photoId, new Set())
    }
    profilePhotoAndFace.get(photoId)!.add(faceId)
  }

  // Get all the photos where the person has been tagged
  const personInPhotoEvents = await getEventList<
    PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
  >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
    personId,
  })
  for (const event of personInPhotoEvents) {
    // Check if it's the latest event for this faceId / personId
    const latest = await getSingleEvent<
      PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
    >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
      photoId: event.payload.photoId,
      faceId: event.payload.faceId,
    })

    if (latest!.id === event.id) {
      photoIds.add(event.payload.photoId)
      addProfilePhotoFace(event.payload.photoId, event.payload.faceId)
    }
  }

  // Get the photos where the link has been done automatically
  const personFaceIds = new Set(personInPhotoEvents.map((event) => event.payload.faceId))
  const { rows: photosWithFaces } = await postgres.query<{ photoId: PhotoId; faces: { faceId: FaceId }[] }>(
    "SELECT payload->>'photoId' AS \"photoId\", payload->'faces' AS faces from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
    [Array.from(personFaceIds)]
  )
  for (const event of photosWithFaces) {
    photoIds.add(event.photoId)
    for (const { faceId } of event.faces) {
      if (personFaceIds.has(faceId)) {
        addProfilePhotoFace(event.photoId, faceId)
      }
    }
  }

  // Check if the photo has been deleted
  const undeletedPhotos = new Set<PhotoId>()
  for (const photoId of photoIds) {
    const isDeleted = await getSingleEvent<UserDeletedPhoto>('UserDeletedPhoto', { photoId })

    if (!isDeleted) {
      undeletedPhotos.add(photoId)
    } else {
      profilePhotoAndFace.delete(photoId)
    }
  }

  // Filter by user accessibility
  const photosAccessibleToUser = []
  for (const photoId of undeletedPhotos) {
    if (await isPhotoAccessibleToUser({ photoId, userId })) {
      photosAccessibleToUser.push({
        photoId,
        url: getPhotoUrlFromId(photoId),
      })
    } else {
      profilePhotoAndFace.delete(photoId)
    }
  }

  // Flatten alternative profile pics
  const alternateProfilePics = Array.from(profilePhotoAndFace).flatMap(([photoId, faceIdSet]) =>
    Array.from(faceIdSet).map((faceId) => ({ faceId, photoId, url: PhotoFaceURL({ photoId, faceId }) }))
  )

  return {
    person: { personId, name, profilePicUrl },
    photos: photosAccessibleToUser,
    alternateProfilePics,
  }
}
