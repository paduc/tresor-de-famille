import express from 'express'

import ReactDOMServer from 'react-dom/server'
import { FactDiagramPage } from './FactDiagramPage'
import { Project } from 'ts-morph'
import path from 'node:path'
import { getFacts } from './getFacts'

export const factDiagramRouter = express.Router()

const html = String.raw

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../../../tsconfig.json'),
})

factDiagramRouter.route('/factDiagram.html').get(async (request, response) => {
  const facts = getFacts(project)

  try {
    response.send(
      html`
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <link href="/style.css" rel="stylesheet" />
          </head>
          <body>
            ${ReactDOMServer.renderToString(FactDiagramPage({ events: facts }))}
          </body>
        </html>
      `
    )
  } catch (error) {
    console.error(error)
  }
})
