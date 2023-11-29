import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { PhotoListPage } from './PhotoListPage'
import { getListPhotosProps } from './getListPhotosProps'
import { PhotoListPageUrl } from './PhotoListPageUrl'

pageRouter.route(PhotoListPageUrl).get(requireAuth(), async (request, response) => {
  const props = await getListPhotosProps(request.session.user!.id)

  responseAsHtml(request, response, PhotoListPage(props))
})
