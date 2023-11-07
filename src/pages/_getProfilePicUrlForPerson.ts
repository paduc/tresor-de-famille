import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { UserSelectedNewProfilePic } from './person/UserSelectedNewProfilePic'

export const getProfilePicUrlForPerson = async (personId: UUID, userId: UUID): Promise<string | null> => {
  const preferredProfilePic = await getSingleEvent<UserSelectedNewProfilePic>(['UserSelectedNewProfilePic'], {
    userId,
    personId,
  })

  if (preferredProfilePic) {
    const { faceId, photoId } = preferredProfilePic.payload
    return `/photo/${photoId}/face/${faceId}`
  }

  const faceEvent = await getSingleEvent<UserConfirmedHisFace>(['UserConfirmedHisFace'], { personId })

  if (faceEvent) {
    const { photoId, faceId } = faceEvent.payload

    return `/photo/${photoId}/face/${faceId}`
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
    return `/photo/${photoId}/face/${faceId}`
  }

  return null
}
