import { postgres } from '../dependencies/database'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { getPersonFamily } from './_getPersonFamily'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

type PersonAndFamily = {
  personId: PersonId
  familyId: FamilyId
}

/**
 * Get all the clones of a person by personId
 * @param { personId }
 * @returns List of persondId including the personId
 */
export const getPersonClones = async ({ personId }: { personId: PersonId }): Promise<PersonAndFamily[]> => {
  const personFamily = await getPersonFamily(personId)
  const originalPersonId = await getOriginalPersonId(personId, personFamily)

  return [originalPersonId, ...(await getClones(originalPersonId.personId))]
}

async function getOriginalPersonId(personId: PersonId, familyId: FamilyId): Promise<PersonAndFamily> {
  const isPersonAClone = await getSingleEvent<PersonClonedForSharing>('PersonClonedForSharing', { personId })

  if (isPersonAClone) {
    return getOriginalPersonId(isPersonAClone.payload.clonedFrom.personId, isPersonAClone.payload.clonedFrom.familyId)
  }

  return { personId, familyId }
}

async function getClones(personId: PersonId): Promise<PersonAndFamily[]> {
  const { rows: clonedEvents } = await postgres.query<PersonClonedForSharing>(
    `SELECT * FROM history WHERE type='PersonClonedForSharing' AND payload->'clonedFrom'->>'personId'=$1`,
    [personId]
  )

  const clones: PersonAndFamily[] = []

  for (const clonedEvent of clonedEvents) {
    const clonePersonId = clonedEvent.payload.personId
    const cloneFamilyId = clonedEvent.payload.familyId

    clones.push({ personId: clonePersonId, familyId: cloneFamilyId })
    clones.push(...(await getClones(clonePersonId)))
  }

  return clones
}
