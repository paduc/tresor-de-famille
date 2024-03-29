import { getEventList } from '../dependencies/getEventList.js'
import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { PersonId } from '../domain/PersonId.js'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself.js'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson.js'

export async function getUsersForPersonId({ personId }: { personId: PersonId }): Promise<AppUserId[]> {
  const personEvents = await getEventList<UserNamedThemself | UserRecognizedThemselfAsPerson>(
    ['UserNamedThemself', 'UserRecognizedThemselfAsPerson'],
    { personId }
  )

  // Use a Set to return unique userIds
  return Array.from(new Set<AppUserId>(personEvents.map((event) => event.payload.userId)))
}
