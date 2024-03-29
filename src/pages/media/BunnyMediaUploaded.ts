import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { MediaId } from '../../domain/MediaId.js'

export type BunnyMediaUploaded = DomainEvent<
  'BunnyMediaUploaded',
  {
    userId: AppUserId
    mediaId: MediaId
    bunnyVideoId: string
    bunnyLibraryId: string
  }
>

export const BunnyMediaUploaded = makeDomainEvent<BunnyMediaUploaded>('BunnyMediaUploaded')
