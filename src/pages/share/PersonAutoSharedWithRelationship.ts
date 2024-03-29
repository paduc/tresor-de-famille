import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PersonId } from '../../domain/PersonId.js'
import { RelationshipId } from '../../domain/RelationshipId.js'

export type PersonAutoSharedWithRelationship = DomainEvent<
  'PersonAutoSharedWithRelationship',
  {
    familyId: FamilyId
    personId: PersonId
    relationshipId: RelationshipId
  }
>

export const PersonAutoSharedWithRelationship = makeDomainEvent<PersonAutoSharedWithRelationship>(
  'PersonAutoSharedWithRelationship'
)
