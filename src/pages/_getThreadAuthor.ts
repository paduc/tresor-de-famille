import { ThreadId } from '../domain/ThreadId'
import { getThreadEvents } from './_getThreadEvents'

export async function getThreadAuthor(threadId: ThreadId) {
  const threadEvents = await getThreadEvents(threadId)
  return threadEvents.at(0)?.payload.userId
}
