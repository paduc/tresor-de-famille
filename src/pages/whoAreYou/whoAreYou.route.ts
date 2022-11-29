import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { WhoAreYouPage } from './WhoAreYou'

pageRouter.route('/qui-es-tu').get(requireAuth(), async (request, response) => {
  console.log(`GET on /qui-es-tu`)

  responseAsHtml(request, response, WhoAreYouPage())
})
