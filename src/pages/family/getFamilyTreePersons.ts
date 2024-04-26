import { getEventList } from '../../dependencies/getEventList.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson.js'
import { UserChangedPersonName } from '../person/UserChangedPersonName.js'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson.js'
import { UserSetFamilyTreeOrigin } from './UserSetFamilyTreeOrigin.js'
import { PersonInTree } from './_components/TreeTypes.js'

export async function getFamilyTreePersons({
  userId,
  familyId,
}: {
  userId: AppUserId
  familyId: FamilyId
}): Promise<PersonInTree[]> {
  const events = await getEventList<
    UserNamedPersonInPhoto | UserNamedThemself | UserCreatedRelationshipWithNewPerson | UserSetFamilyTreeOrigin
  >(['UserNamedPersonInPhoto', 'UserNamedThemself', 'UserCreatedRelationshipWithNewPerson', 'UserSetFamilyTreeOrigin'], {
    familyId,
  })

  const persons = new Map<PersonId, PersonInTree>()
  for (const event of events) {
    const { personId } =
      event.type === 'UserCreatedRelationshipWithNewPerson'
        ? event.payload.newPerson
        : event.type === 'UserSetFamilyTreeOrigin'
        ? event.payload.newPerson
        : event.payload
    if (persons.has(personId)) continue

    const newNameEvent = await getSingleEvent<UserChangedPersonName>('UserChangedPersonName', { personId })

    const { name } = newNameEvent
      ? newNameEvent.payload
      : event.type === 'UserCreatedRelationshipWithNewPerson'
      ? event.payload.newPerson
      : event.type === 'UserSetFamilyTreeOrigin'
      ? event.payload.newPerson
      : event.payload
    const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })
    persons.set(personId, { personId, name, profilePicUrl })
  }

  return Array.from(persons.values())
}
