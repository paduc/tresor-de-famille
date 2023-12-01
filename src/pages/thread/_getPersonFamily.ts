import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { getPersonEvents } from '../_getPersonEvents'
import { PersonClonedForSharing } from '../share/PersonClonedForSharing'

export async function getPersonFamily(personId: PersonId): Promise<FamilyId | null> {
  const personEvents = await getPersonEvents(personId)

  if (!personEvents.length) return null

  // If there is a cloned event, it gives us the family
  const cloneEvent = personEvents.find((e): e is PersonClonedForSharing => e.type === 'PersonClonedForSharing')
  if (cloneEvent) return cloneEvent.payload.familyId

  // Look for familyId in the events that have it
  for (const personEvent of personEvents) {
    switch (personEvent.type) {
      case 'PersonClonedForSharing':
      case 'UserNamedThemself':
      case 'UserNamedPersonInPhoto':
      case 'UserCreatedRelationshipWithNewPerson':
        return personEvent.payload.familyId
    }
  }

  return null
}
