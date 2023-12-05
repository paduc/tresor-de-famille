import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { getPersonEvents } from './_getPersonEvents'
import { exhaustiveGuard } from '../libs/exhaustiveGuard'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

export async function getPersonFamily(personId: PersonId): Promise<FamilyId> {
  const personEvents = await getPersonEvents(personId)

  if (!personEvents.length) {
    throw new Error('Person does not exist')
  }

  // If there is a cloned event, it gives us the family
  const cloneEvent = personEvents.find((e): e is PersonClonedForSharing => e.type === 'PersonClonedForSharing')
  if (cloneEvent) return cloneEvent.payload.familyId

  // Look for familyId in the events that have it
  for (const personEvent of personEvents) {
    const personEventType = personEvent.type
    switch (personEventType) {
      case 'PersonClonedForSharing':
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
