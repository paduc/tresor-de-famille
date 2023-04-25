import { requireAuth } from '../dependencies/authn'
import { addToHistory } from '../dependencies/addToHistory'
import { UserAddedBunnyCDNVideo } from '../events'
import { responseAsHtml } from '../libs/ssr'
import { AddVideoPage } from '../pages'
import { actionsRouter } from './actionsRouter'

actionsRouter.post('/addVideo', requireAuth(), async (request, response) => {
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
