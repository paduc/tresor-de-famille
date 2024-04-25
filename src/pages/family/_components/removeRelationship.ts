import { RelationshipId } from '../../../domain/RelationshipId.js'

type RemoveRelationshipArgs = {
  relationshipId: RelationshipId
}
export const removeRelationship = async ({ relationshipId }: RemoveRelationshipArgs) => {
  // setStatus('saving')
  return fetch(`/family/removeRelationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationshipId }),
  }).then((res) => {
    if (!res.ok) {
      alert("Le retrait de la relation n'a pas pu être sauvegardée.")
      // setStatus('error')
      throw new Error('removal of relationship failed')
    }
  })
}
