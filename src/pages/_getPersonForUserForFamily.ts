import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { getPersonById } from './_getPersonById'
import { getPersonClones } from './_getPersonClones'

type Person = { personId: PersonId; name: string }

export const getPersonForUserForFamily = async ({
  userId,
  familyId,
}: {
  userId: AppUserId
  familyId: FamilyId
}): Promise<Person | null> => {
  const userNamedThemselfEvent = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (!userNamedThemselfEvent) {
    return null
  }

  // // Look for a clone in the target family
  let personId: PersonId = userNamedThemselfEvent.payload.personId
  if (userNamedThemselfEvent.payload.familyId !== familyId) {
    const clones = await getPersonClones({ personId })

    const cloneInFamily = clones.find((clone) => clone.familyId === familyId)
    if (!cloneInFamily) {
      return null
    }

    personId = cloneInFamily.personId
  }

  const person = await getPersonById({ personId })
  if (!person) return null

  const { name } = person

  return { personId, name }

  return null
}
