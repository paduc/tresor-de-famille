import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { MediaStatus } from './MediaStatus'

export type BunnyMediaStatusUpdated = DomainEvent<
  'BunnyMediaStatusUpdated',
  {
    Status: MediaStatus // see https://docs.bunny.net/docs/stream-webhook
    VideoId: string
    LibraryId: string
  }
>

export const BunnyMediaStatusUpdated = makeDomainEvent<BunnyMediaStatusUpdated>('BunnyMediaStatusUpdated')
