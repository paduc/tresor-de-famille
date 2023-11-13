import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'

export const getPersonIdForUserId = async (userId: AppUserId): Promise<PersonId> => {
  const userNamedThemself = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (!userNamedThemself) {
    throw new Error(`Cet utilisateur ne s'est pas encore présenté`)
  }

  const { personId } = userNamedThemself.payload

  return personId
}
