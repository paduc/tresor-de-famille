import express from 'express'

import ReactDOMServer from 'react-dom/server'
import { FactDiagramPage } from './FactDiagramPage.js'
import { Project } from 'ts-morph'
import path from 'node:path'
import { getFacts } from './getFacts.js'

export const factDiagramRouter = express.Router()

const html = String.raw

const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), '../../../tsconfig.json'),
})

factDiagramRouter.route('/factDiagram.html').get(async (request, response, next) => {
  // const userId = request.session.user!.id

  // if (!process.env.ADMIN_USERID || process.env.ADMIN_USERID !== userId) {
  //   return response.status(403).send("Vous n'êtes pas autorisé à accéder à cette page")
  // }

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
