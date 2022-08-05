import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomPage } from './ImportGedcomPage'
import { requireAuth } from '../../dependencies/authn'

pageRouter.route('/importGedcom.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /importGedcom.html`)

  responseAsHtml(request, response, ImportGedcomPage())
})
