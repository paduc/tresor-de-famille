import { postgres } from '../../dependencies/database.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export async function getThreadsContainingPhoto({ photoId }: { photoId: PhotoId }): Promise<ThreadId[]> {
  const { rows } = await postgres.query(
    `SELECT payload->'threadId' as "threadId" FROM history WHERE payload->>'contentAsJSON' LIKE $1`,
    [`%${photoId}%`]
  )

  return rows.map((r) => r.threadId)
}
