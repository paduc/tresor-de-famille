import { z } from 'zod'
import { FamilyId } from '../../../domain/FamilyId.js'
import { zIsPersonId } from '../../../domain/PersonId.js'
import { zIsRelationship } from '../zIsRelationship.js'
import { PersonInTree, RelationshipInTree } from './TreeTypes.js'

type SaveNewRelationshipArgs = {
  newPerson?: PersonInTree
  relationship: RelationshipInTree
  secondaryRelationships: RelationshipInTree[]
  familyId: FamilyId
}
export const saveNewRelationship = async ({
  newPerson,
  relationship,
  secondaryRelationships,
  familyId,
}: SaveNewRelationshipArgs): Promise<{ persons: PersonInTree[]; relationships: RelationshipInTree[] }> => {
  // setStatus('saving')
  const response = await fetch(`/family/saveNewRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPerson, relationship, secondaryRelationships, familyId }),
  })

  if (response.ok && response.status === 200) {
    const data = await response.json()

    const { persons, relationships } = z
      .object({
        persons: z.array(z.object({ profilePicUrl: z.union([z.string(), z.null()]), name: z.string(), personId: zIsPersonId })),
        relationships: z.array(zIsRelationship),
      })
      .parse(data)

    return { persons, relationships }
  }

  return Promise.reject()
}
