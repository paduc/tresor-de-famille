import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { MediaId } from '../../domain/MediaId'

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
