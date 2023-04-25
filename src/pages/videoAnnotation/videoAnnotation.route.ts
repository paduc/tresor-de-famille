import zod from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { openai } from '../../dependencies/LLM'
import { zIsUUID } from '../../domain'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { getVideo } from './getVideo.query'
import { VideoAnnotationPage } from './VideoAnnotationPage'

pageRouter
  .route('/video/:videoId/annotate.html')
  .all(requireAuth())
  .get(async (request, response) => {
    console.log(`GET on /video/:videoId/annotate.html`, request.params)

    try {
      const { videoId } = zod.object({ videoId: zIsUUID }).parse(request.params)

      const { video, sequences } = await getVideo(videoId)

      responseAsHtml(request, response, VideoAnnotationPage({ video, sequences, description: '', parsedDescription: '' }))
    } catch (error: any) {
      console.log({ error })
      return responseAsHtml(request, response, VideoAnnotationPage({ error: error.message }))
    }
  })
  .post(async (request, response) => {
    console.log(`POST on /video/:videoId/annotate.html`)

    const { videoId } = zod.object({ videoId: zIsUUID }).parse(request.params)
    try {
      const { description } = request.body

      console.log(JSON.stringify({ description }, null, 2))

      if (description.length) {
        const prompt = `Fill in this valid JSON document:
{
  "personsInTheMovie": ["name1", "name2"],
  "personThatFilmedThisMovie": "name", // optional: remove this line if not explicitly stated
  "rawDate": "the date as present in the description",
  "parsedDate": {
    "day": "DD",
    "month": "MM",
    "year": "YYYY"
  },
  "occasion": "occasion",
  "locations": ["location1", "location2"],
  "relationships": [{
    "type": "isFatherOf",
    "father": "name1",
    "son": "name2"
  },
  {
    "type": "areSpouses",
    "spouses": ["name1", "name2"]
  },
  {
    "type": "areSiblings",
    "siblings": ["name1", "name2"]
  }]
}

given the following text:
${description}`

        const aiResponse = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt,
          temperature: 0,
          max_tokens: 1000,
        })

        const { data } = aiResponse

        console.log(JSON.stringify({ data }, null, 2))

        const textResponse = data.choices[0].text?.trim().replace(/\n/g, '')
        var parsedResponse = textResponse
        try {
          parsedResponse = JSON.parse(textResponse || '')
        } catch (error) {}

        const { video, sequences } = await getVideo(videoId)

        return responseAsHtml(
          request,
          response,
          VideoAnnotationPage({ video, sequences, description, parsedDescription: parsedResponse })
        )
      }

      // try {
      //   // Parse and validate the form fields using Zod
      //   const { videoId, sequenceId, description, startTime, endTime } = zod
      //     .object({
      //       videoId: zIsUUID,
      //       sequenceId: zIsUUID,
      //       title: zod.string(),
      //       description: zod.string(),
      //       date: zod.string(),
      //       places: zod.union([zCustom(isPlace), zod.array(zCustom(isPlace))]),
      //       persons: zod.union([zIsUUID, zod.array(zIsUUID)]),
      //       startTime: zIsMediaTime,
      //       endTime: zIsMediaTime,
      //     })
      //     .parse(request.body)

      //   await addToHistory(
      //     VideoSequenceAdded({
      //       videoId,
      //       startTime,
      //       endTime,
      //       sequenceId,
      //       title,
      //       description,
      //       date,
      //       places: toArray(places).filter((str) => str.length > 0),
      //       persons: toArray(persons),
      //       addedBy: request.session.user!.id,
      //       addedOn: getEpoch(new Date()),
      //     })
      //   )

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
