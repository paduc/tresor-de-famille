import { ulid } from 'ulid'
import { RelationshipId } from '../domain/RelationshipId'

export const makeRelationshipId = (): RelationshipId => {
  return ulid() as RelationshipId
}
