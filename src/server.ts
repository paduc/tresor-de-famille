import express, { Express } from 'express'
import session from 'express-session'
import path from 'node:path'
require('express-async-errors')

import { actionsRouter } from './actions'
import { registerAuth } from './dependencies/authn'
import { SESSION_SECRET } from './dependencies/env'
import { sessionStore } from './dependencies/session'
import { pageRouter } from './pages'
import { createHistoryTable } from './dependencies/addToHistory'

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

registerAuth(app)

app.use(pageRouter)
app.use(actionsRouter)

app.use(express.static(path.join(__dirname, 'assets')))

app.listen(PORT, async (): Promise<void> => {
  await createHistoryTable()

  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})
