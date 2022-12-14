import { UUID } from '../domain'
import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type BunnyCDNVideo = {
  title: string
  videoId: UUID
  directPlayUrl: string
  hlsPlaylistUrl: string
  thumbnailUrl: string
  previewUrl: string
}

export type UserAddedBunnyCDNVideo = BaseDomainEvent & {
  type: 'UserAddedBunnyCDNVideo'
  payload: BunnyCDNVideo
}

export const UserAddedBunnyCDNVideo = (payload: UserAddedBunnyCDNVideo['payload']): UserAddedBunnyCDNVideo =>
  makeDomainEvent({
    type: 'UserAddedBunnyCDNVideo',
    payload,
  })
