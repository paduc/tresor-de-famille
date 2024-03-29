import express from 'express'

import { FactViewerPage } from './FactViewerPage.js'
import { requireAuth } from '../../dependencies/authn.js'
import ReactDOMServer from 'react-dom/server'
import { getFacts } from './getFacts.js'
import { z } from 'zod'
import { getFactTypes } from './getFactTypes.js'

export const factViewerRouter = express.Router()

const html = String.raw

factViewerRouter.route('/factViewer.html').get(requireAuth(), async (request, response, next) => {
  try {
    const userId = request.session.user!.id

    if (!process.env.ADMIN_USERID || process.env.ADMIN_USERID !== userId) {
      return response.status(403).send("Vous n'êtes pas autorisé à accéder à cette page")
    }

    const { type: types, query } = z
      .object({
        type: z.union([z.string(), z.array(z.string())]).optional(),
        query: z.string().optional(),
      })
      .parse(request.query)

    try {
      const facts = await getFacts({ types, query })
      const factTypes = await getFactTypes()

      response.send(
        html`
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width,initial-scale=1" />
              <link href="/style.css" rel="stylesheet" />
            </head>
            <body>
              ${ReactDOMServer.renderToString(FactViewerPage({ facts, factTypes, query }))}
            </body>
          </html>
        `
      )
    } catch (error) {
      console.error(error)
    }
  } catch (error) {
    next(error)
  }
})
