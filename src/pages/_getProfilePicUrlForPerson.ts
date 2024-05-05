import { getEventList } from '../dependencies/getEventList.js'
import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { FaceId } from '../domain/FaceId.js'
import { PersonId } from '../domain/PersonId.js'
import { PhotoId } from '../domain/PhotoId.js'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace.js'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto.js'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto.js'
import { UserSelectedNewProfilePic } from './person/UserSelectedNewProfilePic.js'

export const getProfilePicUrlForPerson = async ({
  userId,
  personId,
}: {
  userId: AppUserId
  personId: PersonId
}): Promise<string | null> => {
  const faceAndPhoto = await getFaceAndPhotoForPerson({ userId, personId })

  if (faceAndPhoto) {
    const { faceId, photoId } = faceAndPhoto
    return `/photo/${photoId}/face/${faceId}`
  }

  return null
}

export const getFaceAndPhotoForPerson = async ({
  userId,
  personId,
}: {
  userId: AppUserId
  personId: PersonId
}): Promise<{ faceId: FaceId; photoId: PhotoId } | null> => {
  const preferredProfilePic = await getSingleEvent<UserSelectedNewProfilePic>(['UserSelectedNewProfilePic'], {
    userId,
    personId,
  })

  if (preferredProfilePic) {
    const { faceId, photoId } = preferredProfilePic.payload
    return { faceId, photoId }
  }

  const faceEvent = await getSingleEvent<UserConfirmedHisFace>(['UserConfirmedHisFace'], { personId })

  if (faceEvent) {
    const { photoId, faceId } = faceEvent.payload

    return { faceId, photoId }
  }

  const personInPhotoEvents = await getEventList<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      personId,
      userId,
    }
  )

  if (personInPhotoEvents.length) {
    // make sure this person is the latest for this face and photo
    for (const event of personInPhotoEvents) {
      const { faceId, photoId } = event.payload

      const latestEventForFaceAndPhoto = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
        ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
        { faceId, photoId }
      )

      if (latestEventForFaceAndPhoto) {
        const { personId: latestPersonId } = latestEventForFaceAndPhoto.payload

        if (latestPersonId === personId) {
          return { faceId, photoId }
        }
      }
    }
  }

  return null
}
