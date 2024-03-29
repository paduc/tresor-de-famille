import { ulid } from 'ulid'
import { RelationshipId } from '../domain/RelationshipId.js'

export const makeRelationshipId = (): RelationshipId => {
  return ulid() as RelationshipId
}
