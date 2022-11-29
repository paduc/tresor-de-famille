import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { HomePage } from './HomePage'
import { requireAuth } from '../../dependencies/authn'
import { hasUserDesignatedThemselfAsPerson } from './hasUserDesignatedThemselfAsPerson.query'

pageRouter.route('/').get(requireAuth(), async (request, response) => {
  console.log(`GET on /`)

  const userHasDesignatedThemselfAsPerson = await hasUserDesignatedThemselfAsPerson(request.session.user!.id)

  if (!userHasDesignatedThemselfAsPerson) {
    return response.redirect('/qui-es-tu')
  }

  responseAsHtml(request, response, HomePage())
})
