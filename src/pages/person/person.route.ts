import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { PersonPageURL } from './PersonPageURL'
import { z } from 'zod'
import { zIsUUID } from '../../domain'
import { getPersonPageProps } from './getPersonPageProps'
import { PersonPage } from './PersonPage'

pageRouter.route(PersonPageURL()).get(requireAuth(), async (request, response) => {
  const { personId } = z.object({ personId: zIsUUID }).parse(request.params)
  const userId = request.session.user!.id

  const props = await getPersonPageProps(personId, userId)

  responseAsHtml(request, response, PersonPage(props))
})
