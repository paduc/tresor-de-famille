import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ListPhotosPage } from './ListPhotosPage'
import { getListPhotosProps } from './getListPhotosProps'
import { PhotoListPageUrl } from './PhotoListPageUrl'

pageRouter.route(PhotoListPageUrl).get(requireAuth(), async (request, response) => {
  const props = await getListPhotosProps(request.session.user!.id)

  responseAsHtml(request, response, ListPhotosPage(props))
})
