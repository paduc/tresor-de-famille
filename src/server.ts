import * as Sentry from '@sentry/node'
import express, { Express, NextFunction, Request, Response } from 'express'
import session from 'express-session'
import path from 'node:path'
require('express-async-errors')

import { actionsRouter } from './actions'
import { createHistoryTable } from './dependencies/addToHistory'
import { SENTRY_DSN, SESSION_SECRET } from './dependencies/env'
import { sessionStore } from './dependencies/session'
import { factViewerRouter } from './facts/viewer/factViewer.route'
import { pageRouter } from './pages'

const PORT: number = parseInt(process.env.PORT ?? '3000')

const app: Express = express()

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  })
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())
}

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

app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).send()
})

// The error handler must be registered before any other error middleware and after all controllers
if (SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}

// Optional fallthrough error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  // @ts-ignore
  res.status(500).send(`Oops! Une erreur s'est produite. L'administrateur a été prévenu. (code: ${res.sentry})`)
})

app.listen(PORT, async (): Promise<void> => {
  await createHistoryTable()

  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})
