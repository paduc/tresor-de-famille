import { ThreadId } from '../domain/ThreadId'
import { getThreadEvents } from './_getThreadEvents'

/**
 * OLD -> use getThreadFamilies
 * @param threadId
 * @returns
 */
export async function getThreadFamily(threadId: ThreadId) {
  const threadEvents = await getThreadEvents(threadId)
  return threadEvents.at(0)?.payload.familyId
}
