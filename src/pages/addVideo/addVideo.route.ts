import { addToHistory } from '../../dependencies/addToHistory'
import { requireAuth } from '../../dependencies/authn'
import { UserAddedBunnyCDNVideo } from '../../events'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { AddVideoPage } from './AddVideoPage'

pageRouter
  .route('/addVideo.html')
  .get(requireAuth(), async (request, response) => {
    responseAsHtml(request, response, AddVideoPage({}))
  })
  .post(requireAuth(), async (request, response) => {
    const { title, videoId, directPlayUrl, hlsPlaylistUrl, thumbnailUrl, previewUrl } = request.body

    await addToHistory(
      UserAddedBunnyCDNVideo({
        title,
        videoId,
        directPlayUrl,
        hlsPlaylistUrl,
        thumbnailUrl,
        previewUrl,
      })
    )

    responseAsHtml(request, response, AddVideoPage({ success: `Video ${title} ajoutée` }))
  })
