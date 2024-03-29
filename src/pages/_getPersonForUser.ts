import { AppUserId } from '../domain/AppUserId.js'
import { PersonId } from '../domain/PersonId.js'
import { getPersonById } from './_getPersonById.js'
import { getPersonIdForUser } from './_getPersonIdForUser.js'

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
