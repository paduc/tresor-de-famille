import { UUID } from '../../domain'
import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type FaceIdLinkedToPerson = DomainEvent<
  'FaceIdLinkedToPerson',
  {
    faceId: UUID
    personId: UUID
  }
>

export const FaceIdLinkedToPerson = makeDomainEvent<FaceIdLinkedToPerson>('FaceIdLinkedToPerson')
