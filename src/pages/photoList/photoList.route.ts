import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn.js'
import { zIsFamilyId } from '../../domain/FamilyId.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { getUserFamilies } from '../_getUserFamilies.js'
import { pageRouter } from '../pageRouter.js'
import { PhotoListPage } from './PhotoListPage.js'
import { PhotoListPageUrlWithFamily } from './PhotoListPageUrl.js'
import { getPhotoListPageProps } from './getPhotoListPageProps.js'

pageRouter.route(PhotoListPageUrlWithFamily()).get(requireAuth(), async (request, response, next) => {
  try {
    const { familyId } = z.object({ familyId: zIsFamilyId.optional() }).parse(request.params)

    const userId = request.session.user!.id
    const props = await getPhotoListPageProps({ userId, familyId })

    if (!familyId && props.photos.length === 0) {
      // Look for family with photos
      const userFamilies = await getUserFamilies(userId)
      for (const family of userFamilies) {
        if (family.familyId !== asFamilyId(userId)) {
          const photoListProps = await getPhotoListPageProps({
            userId,
            familyId: family.familyId,
          })

          if (photoListProps.photos.length > 0) {
            return response.redirect(PhotoListPageUrlWithFamily(family.familyId))
          }
        }
      }
    }

    responseAsHtml(request, response, PhotoListPage(props))
  } catch (error) {
    next(error)
  }
})
