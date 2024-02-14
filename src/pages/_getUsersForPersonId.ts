import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson'

export async function getUsersForPersonId({ personId }: { personId: PersonId }): Promise<AppUserId[]> {
  const personEvents = await getEventList<UserNamedThemself | UserRecognizedThemselfAsPerson>(
    ['UserNamedThemself', 'UserRecognizedThemselfAsPerson'],
    { personId }
  )

  // Use a Set to return unique userIds
  return Array.from(new Set<AppUserId>(personEvents.map((event) => event.payload.userId)))
}
