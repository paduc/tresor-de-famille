import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'
import { parseFirstPresentation } from './parseFirstPresentation'

pageRouter
  .route('/bienvenue.html')
  .get(requireAuth(), async (request, response) => {
    responseAsHtml(request, response, BienvenuePage({}))
  })
  .post(requireAuth(), async (request, response) => {
    const { presentation } = z.object({ presentation: z.string() }).parse(request.params)

    const userId = request.session.user!.id

    const res = await parseFirstPresentation({ presentation, userId })

    response.redirect('/')
  })
