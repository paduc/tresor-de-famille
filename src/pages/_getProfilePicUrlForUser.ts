import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson'
import { getProfilePicUrlForPerson } from './_getProfilePicUrlForPerson'

export const getProfilePicUrlForUser = async (userId: AppUserId): Promise<string | null> => {
  const person = await getSingleEvent<UserNamedThemself | UserRecognizedThemselfAsPerson>(
    ['UserNamedThemself', 'UserRecognizedThemselfAsPerson'],
    { userId }
  )

  if (!person) return null

  const { personId } = person.payload

  return getProfilePicUrlForPerson({ personId, userId })
}
