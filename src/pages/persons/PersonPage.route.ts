import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { requireAuth } from '../../dependencies/authn'

import { getPersonInfo } from './getPersoInfo.query'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  const personInfo = await getPersonInfo()

  responseAsHtml(request, response, PersonPage({ personInfo }))
})
