import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { VideoAnnotationPage } from './VideoAnnotationPage'
import { getVideo } from './getVideo.query'

pageRouter.route('/video/:videoId/annotate.html').get(requireAuth(), async (request, response) => {
  console.log(`GET on /video/:videoId/annotate.html`, request.params)

  // const { videoId } = request.params

  const videoId = '94969c50-688a-4511-bf46-3c5cb3e0c982'

  const video = await getVideo(videoId)

  responseAsHtml(request, response, VideoAnnotationPage({ video }))
})
