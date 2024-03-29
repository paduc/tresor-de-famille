import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type RelationshipId = string & { isRelationshipId: true }

export const isRelationshipId = (relationshipId: any): relationshipId is RelationshipId => isUUID(relationshipId)

export const zIsRelationshipId = zCustom(isRelationshipId)
