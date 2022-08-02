import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomSuccessPage } from './ImportGedcomSuccessPage'
import { requireAuth } from '../../dependencies/authn'
import { getGedcom } from './getGedcom.query'

pageRouter.route('/importGedcomSuccess.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /importGedcomSucess.html`)

  // @ts-ignore
  return returnImportGedcomSuccesPage(request, response)
})

/* pageRouter.post('/importGedcomSuccess.html').post(async (request, response) => {
  return 'test'
})
 */
export const returnImportGedcomSuccesPage = async (request: Request, response: Response) => {
  const gedcom = await getGedcom()

  /* if (!gedcom) return response.status(404).send() */

  // @ts-ignore
  responseAsHtml(request, response, ImportGedcomSuccessPage({ gedcom }))
}
