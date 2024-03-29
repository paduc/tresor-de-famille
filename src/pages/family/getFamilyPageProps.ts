import { postgres } from '../../dependencies/database.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson.js'
import { UserChangedPersonName } from '../person/UserChangedPersonName.js'

import { FamilyPageProps } from './FamilyPage.js'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson.js'
import { UserRemovedRelationship } from './UserRemovedRelationship.js'

export const getFamilyPageProps = async ({
  userId,
  familyId,
}: {
  userId: AppUserId
  familyId: FamilyId
}): Promise<FamilyPageProps> => {
  const personForUser = await getPersonForUser({ userId })

  const persons = await getFamilyPersons({ userId, familyId })
  const relationships = await getFamilyRelationships(
    persons.map((p) => p.personId),
    familyId
  )

  return {
    initialPersons: persons,
    initialRelationships: relationships,
    initialOriginPersonId: personForUser?.personId,
    familyId,
  }
}

type Person = FamilyPageProps['initialPersons'][number]

export async function getFamilyPersons({ userId, familyId }: { userId: AppUserId; familyId: FamilyId }): Promise<Person[]> {
  const events = await getEventList<UserNamedPersonInPhoto | UserNamedThemself | UserCreatedRelationshipWithNewPerson>(
    ['UserNamedPersonInPhoto', 'UserNamedThemself', 'UserCreatedRelationshipWithNewPerson'],
    {
      familyId,
    }
  )

  const persons = new Map<PersonId, Person>()
  for (const event of events) {
    const { personId } = event.type === 'UserCreatedRelationshipWithNewPerson' ? event.payload.newPerson : event.payload
    if (persons.has(personId)) continue

    const newNameEvent = await getSingleEvent<UserChangedPersonName>('UserChangedPersonName', { personId })

    const { name } = newNameEvent
      ? newNameEvent.payload
      : event.type === 'UserCreatedRelationshipWithNewPerson'
      ? event.payload.newPerson
      : event.payload
    const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })
    persons.set(personId, { personId, name, profilePicUrl })
  }

  return Array.from(persons.values())
}

type Relationship = FamilyPageProps['initialRelationships'][number]

export async function getFamilyRelationships(personIds: PersonId[], familyId: FamilyId): Promise<Relationship[]> {
  const relationships: Relationship[] = []

  const removedRelationshipIds = (await getEventList<UserRemovedRelationship>('UserRemovedRelationship', { familyId })).map(
    (event) => event.payload.relationshipId
  )

  for (const personId of personIds) {
    const parentRelWithNewPerson = await postgres.query<UserCreatedRelationshipWithNewPerson | UserCreatedNewRelationship>(
      `SELECT * FROM history WHERE type = ANY ($1) AND      payload->>'familyId'=$3 AND payload->'relationship'->>'type'='parent' AND payload->'relationship'->>'parentId'=$2 ORDER BY "occurredAt" ASC`,
      [['UserCreatedRelationshipWithNewPerson', 'UserCreatedNewRelationship'], personId, familyId]
    )

    for (const rel of parentRelWithNewPerson.rows) {
      const { id, type } = rel.payload.relationship
      if (type === 'parent' && !removedRelationshipIds.includes(id)) {
        const { parentId, childId } = rel.payload.relationship
        relationships.push({ id, type: 'parent', parentId, childId })
      }
    }

    const spouseRelWithNewPerson = await postgres.query<UserCreatedRelationshipWithNewPerson | UserCreatedNewRelationship>(
      `SELECT * FROM history WHERE type = ANY ($1) AND      payload->>'familyId'=$3 AND payload->'relationship'->>'type'='spouses' AND payload->'relationship'->'spouseIds'->>0 = $2 ORDER BY "occurredAt" ASC`,
      [['UserCreatedRelationshipWithNewPerson', 'UserCreatedNewRelationship'], personId, familyId]
    )

    for (const rel of spouseRelWithNewPerson.rows) {
      const { id, type } = rel.payload.relationship
      if (type === 'spouses' && !removedRelationshipIds.includes(id)) {
        const { spouseIds } = rel.payload.relationship
        relationships.push({ id, type: 'spouses', spouseIds })
      }
    }

    const friendRelWithNewPerson = await postgres.query<UserCreatedRelationshipWithNewPerson | UserCreatedNewRelationship>(
      `SELECT * FROM history WHERE type = ANY ($1) AND      payload->>'familyId'=$3 AND payload->'relationship'->>'type'='friends' AND payload->'relationship'->'friendIds'->>0 = $2 ORDER BY "occurredAt" ASC`,
      [['UserCreatedRelationshipWithNewPerson', 'UserCreatedNewRelationship'], personId, familyId]
    )

    for (const rel of friendRelWithNewPerson.rows) {
      const { id, type } = rel.payload.relationship
      if (type === 'friends' && !removedRelationshipIds.includes(id)) {
        const { friendIds } = rel.payload.relationship
        relationships.push({ id, type: 'friends', friendIds })
      }
    }
  }

  return relationships
}
