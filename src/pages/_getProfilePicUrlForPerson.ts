import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { getProfilePicUrlForUser } from './_getProfilePicUrlForUser'

export const getProfilePicUrlForPerson = async (personId: UUID, userId: UUID): Promise<string | null> => {
  const personAsNamedByThemself = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId, personId })

  if (personAsNamedByThemself) {
    // the person is the user
    return getProfilePicUrlForUser(userId)
  }

  const personNamed = await getSingleEvent<UserNamedPersonInPhoto>(['UserNamedPersonInPhoto'], {
    personId,
    userId,
  })

  if (personNamed) {
    const { faceId, photoId } = personNamed.payload
    return `/photo/${photoId}/face/${faceId}`
  }

  return null
}
