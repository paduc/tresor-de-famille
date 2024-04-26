import { postgres } from '../../dependencies/database.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { UserCreatedNewRelationship } from './UserCreatedNewRelationship.js'
import { UserCreatedRelationshipWithNewPerson } from './UserCreatedRelationshipWithNewPerson.js'
import { UserRemovedRelationship } from './UserRemovedRelationship.js'
import { RelationshipInTree } from './_components/TreeTypes.js'
import { Relationship } from './getFamilyPageProps.js'

export async function getFamilyTreeRelationships(personIds: PersonId[], familyId: FamilyId): Promise<RelationshipInTree[]> {
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
