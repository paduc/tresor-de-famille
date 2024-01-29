import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { getPersonById } from './_getPersonById'
import { getPersonIdForUser } from './_getPersonIdForUser'

type Person = { personId: PersonId; name: string }

export const getPersonForUser = async ({ userId }: { userId: AppUserId }): Promise<Person | null> => {
  const personId = await getPersonIdForUser({ userId })
  if (!personId) {
    return null
  }

  const person = await getPersonById({ personId })

  if (!person) return null

  const { name } = person

  return { personId, name }
}
