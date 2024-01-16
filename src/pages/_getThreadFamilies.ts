import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { ThreadId } from '../domain/ThreadId'
import { ThreadClonedForSharing } from './thread/ThreadPage/ThreadClonedForSharing'
import { ThreadSharedWithFamilies } from './thread/ThreadPage/ThreadSharedWithFamilies'

/**
 * Return all families with which a thread is currently shared
 * does not include the author's personal space (familyID=userId)
 * @param threadId
 * @returns familyIds FamilleId[]
 */
export async function getThreadFamilies(threadId: ThreadId): Promise<FamilyId[] | undefined> {
  const latestShareEvent = await getSingleEvent<ThreadClonedForSharing | ThreadSharedWithFamilies>(
    ['ThreadClonedForSharing', 'ThreadSharedWithFamilies'],
    { threadId }
  )
  switch (latestShareEvent?.type) {
    case 'ThreadClonedForSharing':
      return [latestShareEvent.payload.familyId]
    case 'ThreadSharedWithFamilies':
      return latestShareEvent.payload.familyIds
  }

  return []
}
