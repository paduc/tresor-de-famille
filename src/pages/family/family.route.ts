import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { FamilyPageURL } from './FamilyPageURL'
import { z } from 'zod'
import { UUID, zIsUUID } from '../../domain'
import { getFamilyPageProps } from './getFamilyPageProps'
import { FamilyPage } from './FamilyPage'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  // const { personId } = z.object({ personId: zIsUUID }).parse(request.params)

  const props = await getFamilyPageProps(request.session.user!.id)

  responseAsHtml(request, response, FamilyPage(props))
})
