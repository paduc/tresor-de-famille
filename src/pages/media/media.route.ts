import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { MediaListPageUrl } from './MediaListPageURL'
import { MediaListPage } from './MediaListPage'
import axios from 'axios'
import { z } from 'zod'
import { createHash } from 'node:crypto'

pageRouter.get(MediaListPageUrl, requireAuth(), async (request, response, next) => {
  try {
    responseAsHtml(request, response, MediaListPage({}))
  } catch (error) {
    next(error)
  }
})

const testCollectionId = 'd4648f24-b5ea-437e-b67a-49d05e3256ad'
const LibraryId = process.env.BUNNY_LIBRARY_ID
if (!LibraryId) {
  console.log('BUNNY_LIBRARY_ID is not set')
  process.exit(1)
}

const bunnyApiKey = process.env.BUNNY_API_KEY
if (!bunnyApiKey) {
  console.log('BUNNY_API_KEY is not set')
  process.exit(1)
}

const validityDuration = 60 * 60 * 24 * 1000 // 24 hours

pageRouter.get('/prepareMediaUpload', async (request, response) => {
  try {
    const { filename, collectionId } = z
      .object({ filename: z.string(), collectionId: z.string().catch(testCollectionId) })
      .parse(request.query)

    // TODO: make/get the user's collectionId

    // Use Bunny API to create a video
    const VideoId = await createVideo({ title: filename, collectionId })

    const AuthorizationExpire = Date.now() + validityDuration

    // Create a sha256 hash of the videoId
    const hash = createHash('sha256')
    hash.update(LibraryId + bunnyApiKey + AuthorizationExpire + VideoId)
    const AuthorizationSignature = hash.digest('hex')

    response.send({ AuthorizationSignature, AuthorizationExpire, VideoId, LibraryId })
  } catch (error) {
    console.error(error)
    response.status(500).send('Failed to create video')
  }
})

async function createVideo(params: { title: string; collectionId: string }) {
  const { title, collectionId } = z.object({ title: z.string(), collectionId: z.string().optional() }).parse(params)

  const result = await axios.post(
    `${process.env.BUNNY_URL}/library/${process.env.BUNNY_LIBRARY_ID!}/videos`,
    { title, collectionId },
    {
      headers: {
        AccessKey: `${process.env.BUNNY_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
  return result.data.guid
}
