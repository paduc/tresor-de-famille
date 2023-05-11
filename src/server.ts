import express, { Express } from 'express'
import session from 'express-session'
import path from 'node:path'
require('express-async-errors')

import { actionsRouter } from './actions'
import { SESSION_SECRET } from './dependencies/env'
import { sessionStore } from './dependencies/session'
import { pageRouter } from './pages'
import { createHistoryTable } from './dependencies/addToHistory'
import { postgres } from './dependencies/database'

const PORT: number = parseInt(process.env.PORT ?? '3000')

const app: Express = express()

app.use(
  express.urlencoded({
    extended: false,
    limit: '10mb',
  })
)
app.use(express.json({ limit: '10mb' }))

app.get('/ping', (_: express.Request, response: express.Response): void => {
  response.send('pong')
})

app.use(
  session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    proxy: true,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
)

app.use(pageRouter)
app.use(actionsRouter)

app.use(express.static(path.join(__dirname, 'assets')))

app.listen(PORT, async (): Promise<void> => {
  await createHistoryTable()
  await migrateFromEventsToHistoryTable()

  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})

async function migrateFromEventsToHistoryTable() {
  // Copy each event from the events table to the history table
  // move occurred_at to "occurredAt"

  // Check if history table is empty
  const { rowCount } = await postgres.query('SELECT * FROM history')
  if (rowCount != 0) return

  try {
    // only if events table exists
    const { rows: events } = await postgres.query('SELECT * FROM events')

    if (events.length === 0) return

    try {
      console.log(`${events.length} events to insert into history table`)
      for (const { id, type, occurred_at, payload } of events) {
        // insert into history
        await postgres.query('INSERT INTO history (id, type, payload, "occurredAt") VALUES ($1, $2, $3, $4)', [
          id,
          type,
          payload,
          new Date(occurred_at),
        ])
      }
    } catch (error) {
      console.error('Cannot insert event from events table to history table', error)
    }
  } catch (error) {}
}
