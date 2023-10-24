import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'

export const getProfilePicUrlForUser = async (userId: UUID): Promise<string | null> => {
  const person = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId })

  if (!person) return null

  const { personId } = person.payload

  const faceEvent = await getSingleEvent<UserConfirmedHisFace>(['UserConfirmedHisFace'], { personId })

  if (faceEvent) {
    const { photoId, faceId } = faceEvent.payload

    return `/photo/${photoId}/face/${faceId}`
  }

  const otherFaceEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    { personId }
  )

  if (otherFaceEvent) {
    const { photoId, faceId } = otherFaceEvent.payload

    return `/photo/${photoId}/face/${faceId}`
  }

  return null
}
