import { postgres } from '../dependencies/database'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PersonId } from '../domain/PersonId'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'

import { UserCreatedRelationshipWithNewPerson } from './family/UserCreatedRelationshipWithNewPerson'
import { UserChangedPersonName } from './person/UserChangedPersonName'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

export type PersonById = { name: string }

export const getPersonById = async ({ personId }: { personId: PersonId }): Promise<PersonById | null> => {
  const { rows: personsAddedWithNewRelationship } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson' AND payload->'newPerson'->>'personId'=$1",
    [personId]
  )

  let name = personsAddedWithNewRelationship[0]?.payload.newPerson.name

  const userNamedEvent = await getSingleEvent<
    UserNamedThemself | UserNamedPersonInPhoto | UserChangedPersonName | PersonClonedForSharing
  >(['UserNamedThemself', 'UserNamedPersonInPhoto', 'UserChangedPersonName', 'PersonClonedForSharing'], {
    personId,
  })

  if (userNamedEvent) {
    name = userNamedEvent.payload.name
  }

  if (name) {
    return { name }
  }

  return null
}

export const getPersonByIdOrThrow = async ({ personId }: { personId: PersonId }): Promise<PersonById> => {
  const person = await getPersonById({ personId })
  if (person === null) {
    throw new Error(`Could not retrieve person for id ${personId}`)
  }

  return person
}
