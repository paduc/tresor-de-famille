import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { SharePage } from './SharePage'

pageRouter.route('share.html').get(requireAuth(), async (request, response) => {
  const props = {}

  responseAsHtml(request, response, SharePage(props))
})
