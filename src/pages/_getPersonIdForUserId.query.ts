import { getSingleEvent } from '../dependencies/getSingleEvent'
import { UUID } from '../domain'
import { UserNamedThemself } from './bienvenue/step1-userTellsAboutThemselves/UserNamedThemself'

export const getPersonIdForUserId = async (userId: UUID): Promise<UUID> => {
  const userNamedThemself = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (!userNamedThemself) {
    throw new Error(`Cet utilisateur ne s'est pas encore présenté`)
  }

  const { personId } = userNamedThemself.payload

  return personId
}
