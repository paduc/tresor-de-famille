import { DomainEvent, makeDomainEvent } from '../../../../dependencies/DomainEvent.js'
import { AppUserId } from '../../../../domain/AppUserId.js'
import { FamilyId } from '../../../../domain/FamilyId.js'
import { ThreadId } from '../../../../domain/ThreadId.js'
import { TipTapContentAsJSON } from '../../TipTapTypes.js'

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
