import { postgres } from '../dependencies/database.js'
import { getEventList } from '../dependencies/getEventList.js'
import { PersonId } from '../domain/PersonId.js'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto.js'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself.js'
import { UserCreatedRelationshipWithNewPerson } from './family/UserCreatedRelationshipWithNewPerson.js'
import { UserChangedPersonName } from './person/UserChangedPersonName.js'

export type PersonEvent =
  | UserCreatedRelationshipWithNewPerson
  | UserNamedThemself
  | UserNamedPersonInPhoto
  | UserChangedPersonName

export const getPersonEvents = async (personId: PersonId): Promise<PersonEvent[]> => {
  const personEvents: PersonEvent[] = []

  const { rows: personsAddedWithNewRelationship } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson' AND payload->'newPerson'->>'personId'=$1",
    [personId]
  )

  personEvents.push(...personsAddedWithNewRelationship)

  const userNamedEvents = await getEventList<UserNamedThemself | UserNamedPersonInPhoto | UserChangedPersonName>(
    ['UserNamedThemself', 'UserNamedPersonInPhoto', 'UserChangedPersonName'],
    {
      personId,
    }
  )

  personEvents.push(...userNamedEvents)

  return personEvents.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
