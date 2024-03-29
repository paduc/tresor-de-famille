import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'

export type BunnyUserCollectionCreated = DomainEvent<
  'BunnyUserCollectionCreated',
  {
    userId: AppUserId
    bunnyCollectionId: string
    bunnyLibraryId: string
  }
>

export const BunnyUserCollectionCreated = makeDomainEvent<BunnyUserCollectionCreated>('BunnyUserCollectionCreated')
