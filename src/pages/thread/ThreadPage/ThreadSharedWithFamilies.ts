import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { AppUserId } from '../../../domain/AppUserId'
import { FamilyId } from '../../../domain/FamilyId'
import { ThreadId } from '../../../domain/ThreadId'

export type ThreadSharedWithFamilies = DomainEvent<
  'ThreadSharedWithFamilies',
  {
    threadId: ThreadId

    familyIds: FamilyId[]

    userId: AppUserId
  }
>

export const ThreadSharedWithFamilies = makeDomainEvent<ThreadSharedWithFamilies>('ThreadSharedWithFamilies')
