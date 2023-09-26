import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserConfirmedHisFace } from '../events/onboarding/UserConfirmedHisFace'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'

export const getProfilePicUrlForUser = async (userId: UUID): Promise<string | null> => {
  const person = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId })

  if (!person) return null

  const { personId } = person.payload

  const faceEvent = await getSingleEvent<UserConfirmedHisFace>(['UserConfirmedHisFace'], { personId })

  if (!faceEvent) return null

  const { photoId, faceId } = faceEvent.payload

  return `/photo/${photoId}/face/${faceId}`
}
