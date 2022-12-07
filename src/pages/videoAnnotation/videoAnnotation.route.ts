import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { requireAuth } from '../../dependencies/authn'
import { VideoAnnotationPage } from './VideoAnnotationPage'
import { getVideo } from './getVideo.query'
import zod from 'zod'
import { zIsMediaTime, zIsUUID } from '../../domain'
import { VideoSequenceAdded, zIsPlace } from '../../events'
import { publish } from '../../dependencies/eventStore'
import { getEpoch } from '../../libs/typeguards'

pageRouter
  .route('/video/:videoId/annotate.html')
  .all(requireAuth())
  .get(async (request, response) => {
    console.log(`GET on /video/:videoId/annotate.html`, request.params)

    try {
      const { videoId } = zod.object({ videoId: zod.string().uuid() }).parse(request.params)

      const { video, sequences } = await getVideo(videoId)

      responseAsHtml(request, response, VideoAnnotationPage({ video, sequences }))
    } catch (error: any) {
      return responseAsHtml(request, response, VideoAnnotationPage({ error: error.message }))
    }
  })
  .post(async (request, response) => {
    console.log(`POST on /video/:videoId/annotate.html`)

    try {
      // Parse and validate the form fields using Zod
      const { videoId, sequenceId, title, description, places, persons, startTime, endTime } = zod
        .object({
          videoId: zIsUUID,
          sequenceId: zIsUUID,
          title: zod.string(),
          description: zod.string(),
          places: zod.array(zIsPlace),
          persons: zod.union([zIsUUID, zod.array(zIsUUID)]),
          startTime: zIsMediaTime,
          endTime: zIsMediaTime,
        })
        .parse(request.body)

      await publish(
        VideoSequenceAdded({
          videoId,
          startTime,
          endTime,
          sequenceId,
          title,
          description,
          places,
          persons: Array.isArray(persons) ? persons : [persons],
          addedBy: request.session.user!.id,
          addedOn: getEpoch(new Date()),
        })
      )

      // Redirect to the annotation page
      response.redirect(`/video/${videoId}/annotate.html`)
    } catch (error: any) {
      // If there was an error, render the page again with an error message

      responseAsHtml(request, response, VideoAnnotationPage({ error: error.message }))
    }
  })
