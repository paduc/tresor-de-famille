import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserRecognizedThemselfAsPerson } from '../events/onboarding/UserRecognizedThemselfAsPerson'
import { getPersonById } from './_getPersonById'

type Person = { personId: PersonId; name: string }

export const getPersonForUser = async ({ userId }: { userId: AppUserId }): Promise<Person | null> => {
  const userEvent = await getSingleEvent<UserNamedThemself | UserRecognizedThemselfAsPerson>(
    ['UserNamedThemself', 'UserRecognizedThemselfAsPerson'],
    { userId }
  )

  if (!userEvent) {
    return null
  }

  const { personId } = userEvent.payload

  const person = await getPersonById({ personId })

  if (!person) return null

  const { name } = person

  return { personId, name }
}
