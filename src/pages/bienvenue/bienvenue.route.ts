import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'
import { parseFirstPresentation } from './step1-userTellsAboutThemselves/parseFirstPresentation'
import { getPreviousMessages } from './step1-userTellsAboutThemselves/getPreviousMessages'

pageRouter
  .route('/bienvenue.html')
  .get(requireAuth(), async (request, response) => {
    const props = await getPreviousMessages(request.session.user!.id)
    responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
  .post(requireAuth(), async (request, response) => {
    const { presentation } = z.object({ presentation: z.string() }).parse(request.body)

    const userId = request.session.user!.id

    await parseFirstPresentation({ userAnswer: presentation, userId })

    const props = await getPreviousMessages(request.session.user!.id)

    return responseAsHtml(
      request,
      response,
      BienvenuePage({
        ...props,
      })
    )
  })
