import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomSuccessPage } from './ImportGedcomSuccessPage'
import { requireAuth } from '../../dependencies/authn'
import { getGedcom } from './getGedcom.query'

pageRouter.route('/importGedcomSuccess.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /importGedcomSucess.html`)

  const gedcom = await getGedcom()

  // @ts-ignore
  responseAsHtml(request, response, ImportGedcomSuccessPage({ gedcom }))
})
