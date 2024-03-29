import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export type PhotoAutoSharedWithThread = DomainEvent<
  'PhotoAutoSharedWithThread',
  {
    photoId: PhotoId
    threadId: ThreadId
    familyId: FamilyId
  }
>

export const PhotoAutoSharedWithThread = makeDomainEvent<PhotoAutoSharedWithThread>('PhotoAutoSharedWithThread')
