import { postgres } from '../dependencies/database'
import { getEventList } from '../dependencies/getEventList'
import { PersonId } from '../domain/PersonId'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../events/onboarding/UserNamedThemself'
import { UserCreatedRelationshipWithNewPerson } from './family/UserCreatedRelationshipWithNewPerson'
import { UserChangedPersonName } from './person/UserChangedPersonName'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

export type PersonEvent =
  | UserCreatedRelationshipWithNewPerson
  | UserNamedThemself
  | UserNamedPersonInPhoto
  | UserChangedPersonName
  | PersonClonedForSharing

export const getPersonEvents = async (personId: PersonId): Promise<PersonEvent[]> => {
  const personEvents: PersonEvent[] = []

  const { rows: personsAddedWithNewRelationship } = await postgres.query<UserCreatedRelationshipWithNewPerson>(
    "SELECT * FROM history WHERE type = 'UserCreatedRelationshipWithNewPerson' AND payload->'newPerson'->>'personId'=$1",
    [personId]
  )

  personEvents.push(...personsAddedWithNewRelationship)

  const userNamedEvents = await getEventList<
    UserNamedThemself | UserNamedPersonInPhoto | UserChangedPersonName | PersonClonedForSharing
  >(['UserNamedThemself', 'UserNamedPersonInPhoto', 'UserChangedPersonName', 'PersonClonedForSharing'], {
    personId,
  })

  personEvents.push(...userNamedEvents)

  return personEvents.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
