import { requireAuth } from '../dependencies/authn'
import { publish } from '../dependencies/eventStore'
import { UserAddedBunnyCDNVideo } from '../events'
import { responseAsHtml } from '../libs/ssr'
import { AddVideoPage } from '../pages'
import { actionsRouter } from './actionsRouter'

actionsRouter.post('/addVideo', requireAuth(), async (request, response) => {
  const { title, videoId, directPlayUrl, hlsPlaylistUrl, thumbnailUrl, previewUrl } = request.body

  await publish(
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
