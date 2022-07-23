import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { requireAuth } from '../../dependencies/authn'

pageRouter.route('/').get(requireAuth(), async (request, response) => {
  console.log(`GET on /`)

  responseAsHtml(request, response, HomePage())
})
