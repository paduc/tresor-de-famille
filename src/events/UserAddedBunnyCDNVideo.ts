import { UUID } from '../domain'
import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'

export type BunnyCDNVideo = {
  title: string
  videoId: UUID
  directPlayUrl: string
  hlsPlaylistUrl: string
  thumbnailUrl: string
  previewUrl: string
}

export type UserAddedBunnyCDNVideo = DomainEvent<'UserAddedBunnyCDNVideo', BunnyCDNVideo>

export const UserAddedBunnyCDNVideo = makeDomainEvent<UserAddedBunnyCDNVideo>('UserAddedBunnyCDNVideo')
