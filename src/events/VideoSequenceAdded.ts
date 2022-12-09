import { MediaTime, UUID } from '../domain'
import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing'
import { Epoch, zCustom } from '../libs/typeguards'

export type TaggedPerson = UUID

export type Place = string & { isPlace: true }
export const isPlace = (str: unknown): str is Place => {
  return typeof str === 'string'
}
export const zIsPlace = zCustom(isPlace)

export type VideoSequence = {
  videoId: UUID
  sequenceId: UUID
  startTime?: MediaTime
  endTime?: MediaTime
  title?: string
  description?: string
  places?: Place[]
  date?: string
  persons?: TaggedPerson[]
  addedBy: UUID
  addedOn: Epoch
}

export type VideoSequenceAdded = BaseDomainEvent & {
  type: 'VideoSequenceAdded'
  payload: VideoSequence
}

export const VideoSequenceAdded = (payload: VideoSequenceAdded['payload']): VideoSequenceAdded =>
  makeDomainEvent({
    type: 'VideoSequenceAdded',
    payload,
  })
