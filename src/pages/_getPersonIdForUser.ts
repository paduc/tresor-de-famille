import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { PersonId } from '../domain/PersonId.js'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself.js'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson.js'

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
