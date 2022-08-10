import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PersonPage } from './PersonPage'
import { requireAuth } from '../../dependencies/authn'

import { getPersonInfo } from './getPersoInfo.query'

pageRouter.route('/person/:personId').get(requireAuth(), async (request, response) => {
  console.log(`GET on /person`)

  const personId = request.params.personId.slice(1)
  const userId = request.session.user!.id

  const personInfo = await getPersonInfo({ personId, userId })

  //@ts-ignore
  responseAsHtml(request, response, PersonPage({ userId, personId, personInfo }))
})
