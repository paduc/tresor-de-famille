import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { ListVideosPage } from './ListVideosPage'
import { getVideos } from './getVideos.query'
import { VideoListPageUrl } from './VideoListPageUrl'

pageRouter.route(VideoListPageUrl).get(requireAuth(), async (request, response) => {
  console.log(`GET on ${VideoListPageUrl}`)

  const videos = await getVideos()

  responseAsHtml(request, response, ListVideosPage({ videos }))
})
