import { PersonId } from '../domain/PersonId.js'

import { getPersonEvents } from './_getPersonEvents.js'

export type PersonById = { name: string }

export const getPersonById = async ({ personId }: { personId: PersonId }): Promise<PersonById | null> => {
  const personEvents = await getPersonEvents(personId)

  if (!personEvents.length) return null

  const latestEvent = personEvents.at(-1)!

  switch (latestEvent.type) {
    case 'UserCreatedRelationshipWithNewPerson':
    case 'UserSetFamilyTreeOrigin':
      return { name: latestEvent.payload.newPerson.name }
    case 'UserChangedPersonName':
    case 'UserNamedPersonInPhoto':
    case 'UserNamedThemself':
      return { name: latestEvent.payload.name }
  }
}

export const getPersonByIdOrThrow = async ({ personId }: { personId: PersonId }): Promise<PersonById> => {
  const person = await getPersonById({ personId })
  if (person === null) {
    throw new Error(`Could not retrieve person for id ${personId}`)
  }

  return person
}
