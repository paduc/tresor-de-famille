import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ListPhotosPage } from './ListPhotosPage'
import { getPhotos } from './getPhotos.query'
import { PhotoListPageUrl } from './PhotoListPageUrl'

pageRouter.route(PhotoListPageUrl).get(requireAuth(), async (request, response) => {
  console.log(`GET zon ${PhotoListPageUrl}`)

  const photos = await getPhotos(request.session.user!.id)

  responseAsHtml(request, response, ListPhotosPage({ photos }))
})
