import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { FaceId } from '../domain/FaceId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { UserSelectedNewProfilePic } from './person/UserSelectedNewProfilePic'

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
    const { faceId, photoId } = personInPhotoEvents.at(0)!.payload
    return { faceId, photoId }
  }

  return null
}
