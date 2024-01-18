import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { RelationshipId } from '../../domain/RelationshipId'

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
