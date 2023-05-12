import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { requireAuth } from '../../dependencies/authn'
import { hasUserDesignatedThemselfAsPerson } from './hasUserDesignatedThemselfAsPerson.query'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { getPersonByIdOrThrow } from '../_getPersonById'

pageRouter.route('/').get(requireAuth(), async (request, response) => {
  const userHasDesignatedThemselfAsPerson = await hasUserDesignatedThemselfAsPerson(request.session.user!.id)

  if (!userHasDesignatedThemselfAsPerson) {
    return response.redirect('/qui-es-tu')
  }

  const personId = await getPersonIdForUserId(request.session.user!.id)
  const person = await getPersonByIdOrThrow(personId)

  responseAsHtml(request, response, HomePage({ userName: person.name }))
})
