import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { PhotoListPage } from './PhotoListPage'
import { getPhotoListPageProps } from './getPhotoListPageProps'
import { PhotoListPageUrl, PhotoListPageUrlWithFamily } from './PhotoListPageUrl'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { z } from 'zod'

pageRouter.route(PhotoListPageUrlWithFamily()).get(requireAuth(), async (request, response) => {
  const { familyId } = z.object({ familyId: zIsFamilyId.optional() }).parse(request.params)

  const userId = request.session.user!.id
  const props = await getPhotoListPageProps({ userId: userId, familyId: familyId || (userId as string as FamilyId) })

  responseAsHtml(request, response, PhotoListPage(props))
})
