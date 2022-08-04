import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ImportGedcomSuccessPage } from './ImportGedcomSuccessPage'
import { requireAuth } from '../../dependencies/authn'
import { getGedcom } from './getGedcom.query'
import { UserHasDesignatedHimselfAsPerson } from '../../events/UserHasDesignatedHimselfAsPerson'
import { publish } from '../../dependencies/eventStore'

pageRouter.route('/importGedcomSuccess.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /importGedcomSucess.html`)

  // @ts-ignore
  return returnImportGedcomSuccesPage(request, response)
})

export const returnImportGedcomSuccesPage = async (request: Request, response: Response) => {
  const gedcom = await getGedcom()
  // @ts-ignore
  responseAsHtml(request, response, ImportGedcomSuccessPage({ gedcom }))
}

pageRouter.route('/importGedcomSuccess.html').post(async (request, response) => {
  const { personId } = request.body
  const userId = request.session.id
  console.log('POST on /importGedcomSuccess.html')
  await publish(UserHasDesignatedHimselfAsPerson({ userId, personId }))

  response.redirect('/person/:personId.html')
})
