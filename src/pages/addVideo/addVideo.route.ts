import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { AddVideoPage } from './AddVideoPage'

pageRouter.route('/addVideo.html').get(requireAuth(), async (request, response) => {
  responseAsHtml(request, response, AddVideoPage({}))
})
