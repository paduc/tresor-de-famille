import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'

export type BunnyUserCollectionCreated = DomainEvent<
  'BunnyUserCollectionCreated',
  {
    userId: AppUserId
    bunnyCollectionId: string
    bunnyLibraryId: string
  }
>

export const BunnyUserCollectionCreated = makeDomainEvent<BunnyUserCollectionCreated>('BunnyUserCollectionCreated')
