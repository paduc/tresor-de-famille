import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson'

export const getPersonIdForUser = async ({ userId }: { userId: AppUserId }): Promise<PersonId | null> => {
  const userEvent = await getSingleEvent<UserNamedThemself | UserRecognizedThemselfAsPerson>(
    ['UserNamedThemself', 'UserRecognizedThemselfAsPerson'],
    { userId }
  )

  if (!userEvent) {
    return null
  }

  const { personId } = userEvent.payload

  return personId
}
