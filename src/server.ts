import * as Sentry from '@sentry/node'
import express, { Express, NextFunction, Request, Response } from 'express'
import session from 'express-session'
import path from 'node:path'

import { MulterError } from 'multer'

import cors from 'cors'
import { actionsRouter } from './actions'
import { createHistoryTable, createIndexesOnHistoryTable } from './dependencies/addToHistory'
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

app.use(express.static(path.join(__dirname, 'assets')))

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
