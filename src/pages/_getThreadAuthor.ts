import { ThreadId } from '../domain/ThreadId.js'
import { getThreadEvents } from './_getThreadEvents.js'

export async function getThreadAuthor(threadId: ThreadId) {
  const threadEvents = await getThreadEvents(threadId)
  return threadEvents.at(0)?.payload.userId
}
