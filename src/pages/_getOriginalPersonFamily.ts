import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { exhaustiveGuard } from '../libs/exhaustiveGuard'
import { getPersonEvents } from './_getPersonEvents'

export async function getOriginalPersonFamily(personId: PersonId): Promise<FamilyId> {
  const personEvents = await getPersonEvents(personId)

  if (!personEvents.length) {
    throw new Error('Person does not exist')
  }

  // Look for familyId in the events that have it
  for (const personEvent of personEvents) {
    const personEventType = personEvent.type
    switch (personEventType) {
      case 'UserNamedThemself':
      case 'UserNamedPersonInPhoto':
      case 'UserCreatedRelationshipWithNewPerson':
        return personEvent.payload.familyId
      case 'UserChangedPersonName':
        throw new Error('Person does not exist')
      default:
        return exhaustiveGuard(personEventType)
    }
  }

  throw new Error('Person does not exist')
}
