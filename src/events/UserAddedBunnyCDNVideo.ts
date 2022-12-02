import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type UserAddedBunnyCDNVideo = BaseDomainEvent & {
  type: 'UserAddedBunnyCDNVideo'
  payload: {
    title: string
    videoId: string
    directPlayUrl: string
    thumbnailUrl: string
    previewUrl: string
  }
}

export const UserAddedBunnyCDNVideo = (payload: UserAddedBunnyCDNVideo['payload']): UserAddedBunnyCDNVideo =>
  makeDomainEvent({
    type: 'UserAddedBunnyCDNVideo',
    payload,
  })
