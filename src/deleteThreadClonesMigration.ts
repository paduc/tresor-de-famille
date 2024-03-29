import { addToHistory } from './dependencies/addToHistory.js'
import { postgres } from './dependencies/database.js'
import { getEventList } from './dependencies/getEventList.js'
import { getSingleEvent } from './dependencies/getSingleEvent.js'
import { MigrationFailure } from './events/migrations/MigrationFailure.js'
import { MigrationStart } from './events/migrations/MigrationStart.js'
import { MigrationSuccess } from './events/migrations/MigrationSuccess.js'
import { ThreadClonedForSharing } from './pages/thread/ThreadPage/events/ThreadClonedForSharing.js'

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
