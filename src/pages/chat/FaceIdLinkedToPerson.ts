import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type FaceIdLinkedToPerson = BaseDomainEvent & {
  type: 'FaceIdLinkedToPerson'
  payload: {
    faceId: UUID
    personId: UUID
  }
}

export const FaceIdLinkedToPerson = (payload: FaceIdLinkedToPerson['payload']): FaceIdLinkedToPerson =>
  makeDomainEvent({
    type: 'FaceIdLinkedToPerson',
    payload,
  })
