import { UUID } from '../../domain'
import { BaseDomainEvent, makeDomainEvent } from '../../libs/eventSourcing'

export type AWSFaceIdLinkedToPerson = BaseDomainEvent & {
  type: 'AWSFaceIdLinkedToPerson'
  payload: {
    faceId: string
    personId: UUID
  }
}

export const AWSFaceIdLinkedToPerson = (payload: AWSFaceIdLinkedToPerson['payload']): AWSFaceIdLinkedToPerson =>
  makeDomainEvent({
    type: 'AWSFaceIdLinkedToPerson',
    payload,
  })
