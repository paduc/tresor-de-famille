import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsFamilyId } from '../../domain/FamilyId'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { PhotoListPage } from './PhotoListPage'
import { PhotoListPageUrlWithFamily } from './PhotoListPageUrl'
import { getPhotoListPageProps } from './getPhotoListPageProps'

pageRouter.route(PhotoListPageUrlWithFamily()).get(requireAuth(), async (request, response) => {
  const { familyId } = z.object({ familyId: zIsFamilyId.optional() }).parse(request.params)

  const userId = request.session.user!.id
  const props = await getPhotoListPageProps({ userId, familyId })

  responseAsHtml(request, response, PhotoListPage(props))
})
