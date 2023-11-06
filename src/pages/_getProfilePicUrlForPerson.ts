import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { getProfilePicUrlForUser } from './_getProfilePicUrlForUser'

export const getProfilePicUrlForPerson = async (personId: UUID, userId: UUID): Promise<string | null> => {
  const personAsNamedByThemself = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId, personId })

  if (personAsNamedByThemself) {
    // the person is the user
    return getProfilePicUrlForUser(userId)
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
