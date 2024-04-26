import { FamilyId } from '../domain/FamilyId.js'
import { PersonId } from '../domain/PersonId.js'
import { exhaustiveGuard } from '../libs/exhaustiveGuard.js'
import { getPersonEvents } from './_getPersonEvents.js'

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
      case 'UserSetFamilyTreeOrigin':
        return personEvent.payload.familyId
      case 'UserChangedPersonName':
        throw new Error('Person does not exist')
      default:
        return exhaustiveGuard(personEventType)
    }
  }

  throw new Error('Person does not exist')
}
