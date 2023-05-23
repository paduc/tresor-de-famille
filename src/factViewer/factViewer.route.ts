import express from 'express'

import { FactViewerPage } from './FactViewerPage'
import { requireAuth } from '../dependencies/authn'
import ReactDOMServer from 'react-dom/server'
import { getFacts } from './getFacts'

export const factViewerRouter = express.Router()

const html = String.raw

factViewerRouter.route('/factViewer.html').get(requireAuth(), async (_, response) => {
  const facts = await getFacts()

  response.send(
    html`
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link href="/style.css" rel="stylesheet" />
        </head>
        <body>
          ${ReactDOMServer.renderToString(FactViewerPage({ facts }))}
        </body>
      </html>
    `
  )
})
