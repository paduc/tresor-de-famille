import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'

export type PhotoAutoSharedWithThread = DomainEvent<
  'PhotoAutoSharedWithThread',
  {
    photoId: PhotoId
    threadId: ThreadId
    familyId: FamilyId
  }
>

export const PhotoAutoSharedWithThread = makeDomainEvent<PhotoAutoSharedWithThread>('PhotoAutoSharedWithThread')
