import express, { Express, NextFunction, Request, Response } from 'express'
import session from 'express-session'
import * as Sentry from '@sentry/node'
import path from 'node:path'
require('express-async-errors')

import { actionsRouter } from './actions'
import { SENTRY_DSN, SESSION_SECRET } from './dependencies/env'
import { sessionStore } from './dependencies/session'
import { pageRouter } from './pages'
import { createHistoryTable } from './dependencies/addToHistory'
import { postgres } from './dependencies/database'
import { factViewerRouter } from './facts/viewer/factViewer.route'
import { getEventList } from './dependencies/getEventList'
import { DomainEvent } from './dependencies/DomainEvent'

const PORT: number = parseInt(process.env.PORT ?? '3000')

const app: Express = express()

Sentry.init({
  dsn: SENTRY_DSN,
})

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

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

// app.use(factDiagramRouter)
app.use(factViewerRouter)

app.use(express.static(path.join(__dirname, 'assets')))

// app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
//   res.status(500).send()
// })

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

// Optional fallthrough error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  // @ts-ignore
  res.status(500).send(`Oops! Une erreur s'est produite. L'administrateur a été prévenu. (code: ${res.sentry})`)
})

app.listen(PORT, async (): Promise<void> => {
  await createHistoryTable()
  await migrateAddFamilyId()

  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})

async function migrateAddFamilyId() {
  console.log('Starting familyId migration')
  // For each event
  // 1) if its in the no-family id types, ignore
  // 2) if its in the payload.userId = userId types, set familyId=userId
  // 3) Special cases : "uploadedBy", etc. set familyId=uploadedBy, etc.

  // ONLY IF FAMILYID IS NOT SET

  // Check if history table is empty
  const { rows } = await postgres.query<DomainEvent>('SELECT * FROM history')

  let queryCount = 0

  async function update(event: DomainEvent, key: string) {
    await postgres.query(`UPDATE history SET payload=payload||$1 where id=$2;`, [
      `{"familyId":"${event.payload[key]}"}`,
      event.id,
    ])
    queryCount++
  }

  const events = rows
    .filter(
      ({ type }) =>
        ![
          'UserRegisteredWithEmailAndPassword',
          'BeneficiariesChosen',
          'AWSDetectedFacesInPhoto',
          'OpenAIFailedToMakeDeductions',
          'OpenAIMadeDeductions',
          'OpenAIPrompted',
        ].includes(type)
    )
    .filter(({ payload }) => !payload.familyId)

  for (const event of events) {
    if (event.payload.userId) {
      await update(event, 'userId')
      continue
    }

    if (event.payload.importedBy) {
      await update(event, 'importedBy')
      continue
    }

    if (event.payload.ignoredBy) {
      await update(event, 'ignoredBy')
      continue
    }

    if (event.payload.uploadedBy) {
      await update(event, 'uploadedBy')
      continue
    }

    if (event.payload.addedBy) {
      await update(event, 'addedBy')
      continue
    }
    if (event.payload.annotatedBy) {
      await update(event, 'annotatedBy')
      continue
    }
    if (event.payload.confirmedBy) {
      await update(event, 'confirmedBy')
      continue
    }
  }

  console.log(`Migration done with ${queryCount} queries`)
}
