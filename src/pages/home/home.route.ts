import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'

pageRouter.route('/').get(requireAuth(), async (request, response) => {
  try {
    const personId = await getPersonIdForUserId(request.session.user!.id)
    const person = await getPersonByIdOrThrow(personId)
    responseAsHtml(request, response, HomePage({ userName: person.name }))
  } catch (error) {
    return response.redirect('/bienvenue.html')
  }
})
