import { ProjectionTable } from './libs/eventSourcing/types/Projection'
import { getHistory, init as initEventStore } from './dependencies/eventStore'
import { SEED } from './dependencies/env'
import { tables } from './tables/tables'
import { seed } from './seed'

async function migrate() {
  console.log('Starting migration...')

  try {
    // Create the event store
    await initEventStore()

    if (SEED && process.env.NODE_ENV !== 'test') {
      // Seed the history
      await seed()
    }

    // Step 1: prepare the projections (ex: create the table)
    const projectionsToRebuild: ProjectionTable[] = []
    for (const projection of tables) {
      if (await projection.requiresRebuild()) {
        await projection.reset()
        projectionsToRebuild.push(projection)
      }
    }

    // Step 2: Build the projections from history
    const events = await getHistory()
    for (const event of events) {
      for (const projection of projectionsToRebuild) {
        await projection.handleEvent(event)
      }
    }
  } catch (error) {
    console.log('Migration failed', error)
    process.exit(1)
  }

  console.log('Migration succes !')

  process.exit(0)
}

migrate()
