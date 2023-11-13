import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type RelationshipId = string & { isRelationshipId: true }

export const isRelationshipId = (relationshipId: any): relationshipId is RelationshipId => isUUID(relationshipId)

export const zIsRelationshipId = zCustom(isRelationshipId)
