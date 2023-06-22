import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { BienvenuePage } from './BienvenuePage'

pageRouter
  .route('/bienvenue.html')
  .get(requireAuth(), async (request, response) => {
    responseAsHtml(request, response, BienvenuePage({}))
  })
  .post(requireAuth(), async (_, response) => {
    response.redirect('/')
  })
