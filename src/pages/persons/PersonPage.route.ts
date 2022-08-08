import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { requireAuth } from '../../dependencies/authn'

import { getRelationships } from './getRelationships.query'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  const relationships = await getRelationships()

  responseAsHtml(request, response, PersonPage({ relationships }))
})
