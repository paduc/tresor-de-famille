import { AppUserId } from '../domain/AppUserId'
import { getPersonIdForUser } from './_getPersonIdForUser'
import { getProfilePicUrlForPerson } from './_getProfilePicUrlForPerson'

export const getProfilePicUrlForUser = async (userId: AppUserId): Promise<string | null> => {
  const personId = await getPersonIdForUser({ userId })

  if (!personId) return null

  return getProfilePicUrlForPerson({ personId, userId })
}
