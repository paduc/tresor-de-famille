import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type BunnyMediaStatusUpdate = DomainEvent<
  'BunnyMediaStatusUpdate',
  {
    Status: number // see https://docs.bunny.net/docs/stream-webhook
    VideoId: string
    LibraryId: string
  }
>

export const BunnyMediaStatusUpdate = makeDomainEvent<BunnyMediaStatusUpdate>('BunnyMediaStatusUpdate')
