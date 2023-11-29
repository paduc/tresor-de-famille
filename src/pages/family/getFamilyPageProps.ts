import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getPersonForUser } from '../_getPersonForUser'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'
import { UserChangedPersonName } from '../person/UserChangedPersonName'
import { PersonClonedForSharing } from '../share/PersonClonedForSharing'

import { FamilyPageProps } from './FamilyPage'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson'
import { UserRemovedRelationship } from './UserRemovedRelationship'

export const getFamilyPageProps = async ({
  userId,
  familyId,
}: {
  userId: AppUserId
  familyId: FamilyId
}): Promise<FamilyPageProps> => {
  const userPersonInFamily = await getPersonForUser({ userId })

  const persons = await getFamilyPersons({ userId, familyId })
  const relationships = await getFamilyRelationships(
    persons.map((p) => p.personId),
    familyId
  )

  if (!persons.length) {
    // Ce cas ne devrait pas exister puisque lors de la création d'une famille, nous "clone" la personne de l'utilisateur
    throw new Error("Il n'y a personne dans cette famille")
  }

  return { initialPersons: persons, initialRelationships: relationships, initialOriginPersonId: userPersonInFamily?.personId }
}

type Person = FamilyPageProps['initialPersons'][number]

async function getFamilyPersons({ userId, familyId }: { userId: AppUserId; familyId: FamilyId }): Promise<Person[]> {
  const events = await getEventList<
    UserNamedPersonInPhoto | UserNamedThemself | UserCreatedRelationshipWithNewPerson | PersonClonedForSharing
  >(['UserNamedPersonInPhoto', 'UserNamedThemself', 'UserCreatedRelationshipWithNewPerson', 'PersonClonedForSharing'], {
    familyId,
  })

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

async function getFamilyRelationships(personIds: PersonId[], familyId: FamilyId): Promise<Relationship[]> {
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
