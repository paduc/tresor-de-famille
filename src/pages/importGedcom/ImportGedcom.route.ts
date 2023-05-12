import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomPage } from './ImportGedcomPage'
import { requireAuth } from '../../dependencies/authn'

pageRouter.route('/importGedcom.html').get(requireAuth(), async (request, response) => {
  responseAsHtml(request, response, ImportGedcomPage())
})
