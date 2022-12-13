import express, { Express } from 'express'
require('express-async-errors')
import session from 'express-session'
import path from 'node:path'

import { tables } from './tables'
import { sessionStore } from './dependencies/session'
import { pageRouter } from './pages'
import { actionsRouter } from './actions'
import { registerAuth } from './dependencies/authn'
import { subscribeAll } from './dependencies/eventStore'
import { SESSION_SECRET } from './dependencies/env'

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

app.listen(PORT, (): void => {
  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)

  subscribeAll(async (event) => {
    for (const projectionTable of tables) {
      await projectionTable.handleEvent(event)
    }
  })
})
