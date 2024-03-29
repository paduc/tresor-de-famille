import { DomainEvent, makeDomainEvent } from '../../../../dependencies/DomainEvent.js'
import { AppUserId } from '../../../../domain/AppUserId.js'
import { FamilyId } from '../../../../domain/FamilyId.js'
import { ThreadId } from '../../../../domain/ThreadId.js'

export type ThreadSharedWithFamilies = DomainEvent<
  'ThreadSharedWithFamilies',
  {
    threadId: ThreadId

    familyIds: FamilyId[]

    userId: AppUserId
  }
>

export const ThreadSharedWithFamilies = makeDomainEvent<ThreadSharedWithFamilies>('ThreadSharedWithFamilies')
