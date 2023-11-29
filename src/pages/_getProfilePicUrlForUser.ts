import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { getProfilePicUrlForPerson } from './_getProfilePicUrlForPerson'

export const getProfilePicUrlForUser = async (userId: AppUserId): Promise<string | null> => {
  const person = await getSingleEvent<UserNamedThemself>(['UserNamedThemself'], { userId })

  if (!person) return null

  const { personId } = person.payload

  return getProfilePicUrlForPerson({ personId, userId })
}
