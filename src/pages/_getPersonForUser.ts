import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { getPersonById } from './_getPersonById'

type Person = { personId: PersonId; name: string }

export const getPersonForUser = async ({ userId }: { userId: AppUserId }): Promise<Person | null> => {
  const userNamedThemself = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (!userNamedThemself) {
    return null
  }

  const { personId } = userNamedThemself.payload

  const person = await getPersonById({ personId })

  if (!person) return null

  const { name } = person

  return { personId, name }
}
