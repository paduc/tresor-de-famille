import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { ThreadId } from '../../../domain/ThreadId'
import { TipTapContentAsJSON } from '../TipTapTypes'

export type ThreadClonedForSharing = DomainEvent<
  'ThreadClonedForSharing',
  {
    userId: AppUserId
    familyId: FamilyId

    threadId: ThreadId

    title?: string
    contentAsJSON: TipTapContentAsJSON

    clonedFrom: {
      familyId: FamilyId
      threadId: ThreadId
    }
  }
>

export const ThreadClonedForSharing = makeDomainEvent<ThreadClonedForSharing>('ThreadClonedForSharing')
