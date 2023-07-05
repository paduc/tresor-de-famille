import express, { Express } from 'express'
import { factDiagramRouter } from './factDiagram.route'
require('express-async-errors')
import path from 'node:path'

const PORT: number = parseInt(process.env.PORT ?? '3001')

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
app.use(express.static(path.join(__dirname, '../../assets')))

app.use(factDiagramRouter)

app.listen(PORT, async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT)
})
