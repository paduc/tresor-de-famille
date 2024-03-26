import { addToHistory } from './dependencies/addToHistory'
import { postgres } from './dependencies/database'
import { getEventList } from './dependencies/getEventList'
import { getSingleEvent } from './dependencies/getSingleEvent'
import { MigrationFailure } from './events/migrations/MigrationFailure'
import { MigrationStart } from './events/migrations/MigrationStart'
import { MigrationSuccess } from './events/migrations/MigrationSuccess'
import { ThreadClonedForSharing } from './pages/thread/ThreadPage/events/ThreadClonedForSharing'

export const deleteThreadclonesMigration = async () => {
  const migrationName = 'deleteThreadClones'
  const migration = await getSingleEvent<MigrationStart>('MigrationStart', { name: migrationName })

  if (migration) return

  await addToHistory(MigrationStart({ name: migrationName }))

  try {
    const threadClonedEvents = await getEventList<ThreadClonedForSharing>(['ThreadClonedForSharing'])

    for (const {
      payload: { threadId: cloneThreadId },
    } of threadClonedEvents) {
      await postgres.query(`DELETE FROM HISTORY WHERE payload->>'threadId'=$1`, [cloneThreadId])
    }

    await addToHistory(MigrationSuccess({ name: migrationName }))
  } catch (error) {
    console.error(`Migration ${migrationName} failed`, error)
    await addToHistory(MigrationFailure({ name: migrationName }))
  }
}
