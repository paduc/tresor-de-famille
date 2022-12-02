import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ListVideosPage } from './ListVideosPage'
import { getVideos } from './getVideos.query'

pageRouter.route('/videos.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /videos.html`)

  const videos = await getVideos()

  responseAsHtml(request, response, ListVideosPage({ videos }))
})
