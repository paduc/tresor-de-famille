import { getEventList } from '../../dependencies/getEventList'
import { UUID } from '../../domain'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'

import { FamilyPageProps } from './FamilyPage'

export const getFamilyPageProps = async (userId: UUID): Promise<FamilyPageProps> => {
  const userPersonId = await getPersonIdForUserId(userId)

  const persons = await getUserFamilyPersonIds(userId)

  return { initialPersons: persons, initialRelationships: [], initialOriginPersonId: userPersonId }
}

type Person = FamilyPageProps['initialPersons'][number]
async function getUserFamilyPersonIds(userId: UUID): Promise<Person[]> {
  const events = await getEventList<UserNamedPersonInPhoto | UserNamedThemself>(
    ['UserNamedPersonInPhoto', 'UserNamedThemself'],
    { userId: userId }
  )

  const persons = new Map<UUID, Person>()
  for (const event of events) {
    const { personId } = event.payload
    if (persons.has(personId)) continue

    const { name } = event.payload
    const profilePicUrl = await getProfilePicUrlForPerson(personId, userId)
    persons.set(personId, { personId, name, profilePicUrl })
  }

  return Array.from(persons.values())
}
