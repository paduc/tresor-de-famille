import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { ThreadId } from '../domain/ThreadId.js'
import { getThreadAuthor } from './_getThreadAuthor.js'
import { getUserFamilies } from './_getUserFamilies.js'
import { ThreadSharedWithFamilies } from './thread/ThreadPage/events/ThreadSharedWithFamilies.js'

export async function isThreadSharedWithUser({
  threadId,
  userId,
}: {
  threadId: ThreadId
  userId: AppUserId
}): Promise<boolean> {
  const threadAuthor = await getThreadAuthor(threadId)

  if (threadAuthor === userId) {
    return true
  }

  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

  const shareEvents = await getSingleEvent<ThreadSharedWithFamilies>(['ThreadSharedWithFamilies'], { threadId })

  if (!shareEvents) {
    return false
  }

  for (const userFamilyId of userFamilyIds) {
    if (shareEvents.payload.familyIds.includes(userFamilyId)) {
      return true
    }
  }

  return false
}
