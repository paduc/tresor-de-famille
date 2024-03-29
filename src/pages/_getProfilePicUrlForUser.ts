import { AppUserId } from '../domain/AppUserId.js'
import { getPersonIdForUser } from './_getPersonIdForUser.js'
import { getProfilePicUrlForPerson } from './_getProfilePicUrlForPerson.js'

export const getProfilePicUrlForUser = async (userId: AppUserId): Promise<string | null> => {
  const personId = await getPersonIdForUser({ userId })

  if (!personId) return null

  return getProfilePicUrlForPerson({ personId, userId })
}
