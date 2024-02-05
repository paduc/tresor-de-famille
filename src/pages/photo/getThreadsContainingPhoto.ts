import { postgres } from '../../dependencies/database'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'

export async function getThreadsContainingPhoto({ photoId }: { photoId: PhotoId }): Promise<ThreadId[]> {
  const { rows } = await postgres.query(
    `SELECT payload->'threadId' as "threadId" FROM history WHERE payload->>'contentAsJSON' LIKE $1`,
    [`%${photoId}%`]
  )

  return rows.map((r) => r.threadId)
}
