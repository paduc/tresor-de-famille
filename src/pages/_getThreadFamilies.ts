import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { FamilyId } from '../domain/FamilyId.js'
import { ThreadId } from '../domain/ThreadId.js'
import { ThreadSharedWithFamilies } from './thread/ThreadPage/events/ThreadSharedWithFamilies.js'

/**
 * Return all families with which a thread is currently shared
 * does not include the author's personal space (familyID=userId)
 * @param threadId
 * @returns familyIds FamilleId[]
 */
export async function getThreadFamilies(threadId: ThreadId): Promise<FamilyId[] | undefined> {
  const latestShareEvent = await getSingleEvent<ThreadSharedWithFamilies>(['ThreadSharedWithFamilies'], { threadId })

  if (latestShareEvent) {
    return latestShareEvent.payload.familyIds
  }

  return []
}
