import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { zIsMediaTime, zIsUUID } from '../../domain'
import { isPlace, VideoSequenceAdded } from '../../events'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getEpoch, zCustom } from '../../libs/typeguards'
import { pageRouter } from '../pageRouter'
import { getVideo } from './getVideo.query'
import { VideoAnnotationPage } from './VideoAnnotationPage'
import { addToHistory } from '../../dependencies/addToHistory'
import { zIsPersonId } from '../../domain/PersonId'

pageRouter
  .route('/video/:videoId/annotate.html')
  .all(requireAuth())
  .get(async (request, response) => {
    try {
      const { videoId } = zod.object({ videoId: zIsUUID }).parse(request.params)

      const { video, sequences } = await getVideo(videoId)

      responseAsHtml(request, response, VideoAnnotationPage({ video, sequences }))
    } catch (error: any) {
      console.error({ error })
      return responseAsHtml(request, response, VideoAnnotationPage({ error: error.message }))
    }
  })
  .post(async (request, response) => {
    try {
      // Parse and validate the form fields using Zod
      const { videoId, sequenceId, title, description, date, places, persons, startTime, endTime } = zod
        .object({
          videoId: zIsUUID,
          sequenceId: zIsUUID,
          title: zod.string(),
          description: zod.string(),
          date: zod.string(),
          places: zod.union([zCustom(isPlace), zod.array(zCustom(isPlace))]),
          persons: zod.union([zIsPersonId, zod.array(zIsPersonId)]),
          startTime: zIsMediaTime,
          endTime: zIsMediaTime,
        })
        .parse(request.body)

      await addToHistory(
        VideoSequenceAdded({
          videoId,
          startTime,
          endTime,
          sequenceId,
          title,
          description,
          date,
          places: toArray(places).filter((str) => str.length > 0),
          persons: toArray(persons),
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

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item]
}
