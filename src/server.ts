import * as Sentry from '@sentry/node'
import express, { Express, NextFunction, Request, Response } from 'express'
import session from 'express-session'
import path from 'node:path'

import { MulterError } from 'multer'

import cors from 'cors'
import morgan from 'morgan'
import { actionsRouter } from './actions/index.js'
import { createHistoryTable, createIndexesOnHistoryTable } from './dependencies/addToHistory.js'
import { SENTRY_DSN, SESSION_SECRET } from './dependencies/env.js'
import { sessionStore } from './dependencies/session.js'
import { factViewerRouter } from './facts/viewer/factViewer.route.js'
import { pageRouter } from './pages/index.js'
import { getDirname } from './libs/getDirname.js'

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
  morgan('tiny', {
    skip: (req: Request, res) => req.path.startsWith('/style') || req.path.startsWith('/js') || req.path.startsWith('/favicon'),
  })
)

if (process.env.NODE_ENV !== 'production') {
  app.use(cors())
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

app.post('/api/auth', (req: Request, res: Response) => {
  console.log('auth', req.body)
  res.send('ok')
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

app.use(factViewerRouter)

const staticPath = path.join(getDirname(import.meta.url), 'assets')
app.use(express.static(staticPath))

// Error catcher to return proper codes to the caller (browser)
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).send('Votre fichier dépasse la taille maximum.')
      case 'LIMIT_FILE_COUNT':
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).send('Votre envoi dépasse le nombre maximum de fichiers.')
    }
  }

  next(err)
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
  res.status(500).send(`Oops! Une erreur s'est produite. L'administrateur a été prévenu. (code: ${res.sentry || 500})`)
})

app.listen(PORT, async (): Promise<void> => {
  await createHistoryTable()
  await createIndexesOnHistoryTable()
  // await threadCloneMigration()
  // await photoCloneMigration()
  // await personCloneMigration()
  // await deleteThreadclonesMigration()

  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})
