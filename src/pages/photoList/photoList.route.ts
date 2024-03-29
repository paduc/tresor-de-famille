import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn.js'
import { zIsFamilyId } from '../../domain/FamilyId.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { pageRouter } from '../pageRouter.js'
import { PhotoListPage } from './PhotoListPage.js'
import { PhotoListPageUrlWithFamily } from './PhotoListPageUrl.js'
import { getPhotoListPageProps } from './getPhotoListPageProps.js'

pageRouter.route(PhotoListPageUrlWithFamily()).get(requireAuth(), async (request, response, next) => {
  try {
    const { familyId } = z.object({ familyId: zIsFamilyId.optional() }).parse(request.params)

    const userId = request.session.user!.id
    const props = await getPhotoListPageProps({ userId, familyId })

    responseAsHtml(request, response, PhotoListPage(props))
  } catch (error) {
    next(error)
  }
})
