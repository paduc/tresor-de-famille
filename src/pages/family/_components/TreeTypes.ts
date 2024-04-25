import type { Node, Edge } from 'reactflow'
import { PersonId } from '../../../domain/PersonId.js'
import { RelationshipId } from '../../../domain/RelationshipId.js'

export type PersonInTree = {
  profilePicUrl: string | null
  name: string
  personId: PersonId
}

export type RelationshipInTree = { id: RelationshipId } & (
  | {
      type: 'parent'
      parentId: PersonId
      childId: PersonId
    }
  | {
      type: 'spouses'
      spouseIds: [PersonId, PersonId] // in which order ? alphabetical on PersonId ?
    }
  | {
      type: 'friends'
      friendIds: [PersonId, PersonId]
    }
)

export type PersonsRelationshipsInTree = {
  origin: {
    personId: PersonId
    x: number
    y: number
  }
  persons: PersonInTree[]
  relationships: RelationshipInTree[]
}

export type PendingNodeRelationshipAction = {
  personId: PersonId
  relationshipAction: NewRelationshipAction
}
export type NewRelationshipAction = 'addChild' | 'addParent' | 'addFriend' | 'addSpouse'
