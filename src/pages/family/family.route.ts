import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { FamilyPage } from './FamilyPage'
import { FamilyPageURL } from './FamilyPageURL'
import { getFamilyPageProps } from './getFamilyPageProps'

pageRouter.route(FamilyPageURL()).get(requireAuth(), async (request, response) => {
  // const { personId } = z.object({ personId: zIsUUID }).parse(request.params)

  const props = await getFamilyPageProps(request.session.user!.id)

  console.log({ props })

  responseAsHtml(request, response, FamilyPage(props))
})
