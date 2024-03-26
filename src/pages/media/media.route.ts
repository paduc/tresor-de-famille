import { requireAuth } from '../../dependencies/authn'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { MediaListPageUrl } from './MediaListPageURL'
import { MediaListPage } from './MediaListPage'
import axios from 'axios'
import { ZodError, z } from 'zod'
import { createHash } from 'node:crypto'
import { AppUserId } from '../../domain/AppUserId'
import { addToHistory } from '../../dependencies/addToHistory'
import { BunnyUserCollectionCreated } from './BunnyUserCollectionCreated'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { BunnyMediaUploaded } from './BunnyMediaUploaded'
import { zIsMediaId } from '../../domain/MediaId'
import { MediaUploadCompleteURL } from './MediaUploadCompleteURL'
import { makeMediaId } from '../../libs/makeMediaId'
import { BunnyMediaStatusUpdate } from './BunnyMediaStatusUpdate'

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

pageRouter.get('/prepareMediaUpload', requireAuth(), async (request, response) => {
  try {
    const user = request.session.user!

    const { filename } = z.object({ filename: z.string() }).parse(request.query)

    // Fetch the user's collection
    const collectionId = await fetchUserCollection({ userId: user.id })

    // Use Bunny API to create a video
    const VideoId = await createVideo({ title: filename, collectionId })

    const AuthorizationExpire = Date.now() + validityDuration

    // Create a sha256 hash of the videoId
    const hash = createHash('sha256')
    hash.update(LibraryId + bunnyApiKey + AuthorizationExpire + VideoId)
    const AuthorizationSignature = hash.digest('hex')

    response.send({ AuthorizationSignature, AuthorizationExpire, VideoId, LibraryId, collectionId })
  } catch (error) {
    console.error((error as Error).message)
    response.status(500).send('Failed to create video')
  }
})

// The client calls this endpoint after the media has been uploaded to BunnyCDN
pageRouter.post(MediaUploadCompleteURL, requireAuth(), async (request, response) => {
  try {
    const user = request.session.user!
    const { LibraryId, VideoId } = z.object({ LibraryId: z.string(), VideoId: z.string() }).parse(request.body)

    await addToHistory(
      BunnyMediaUploaded({ mediaId: makeMediaId(), userId: user.id, bunnyLibraryId: LibraryId, bunnyVideoId: VideoId })
    )

    response.send({ status: 'ok' })
  } catch (error) {
    console.error((error as Error).message)
    response.status(500).send('Failed to complete media upload')
  }
})

pageRouter.post('/bunnyMediaHook', async (request, response, next) => {
  try {
    const { Status, VideoGuid, VideoLibraryId } = z
      .object({ Status: z.number(), VideoGuid: z.string(), VideoLibraryId: z.string() })
      .parse(request.body)

    await addToHistory(BunnyMediaStatusUpdate({ Status, VideoId: VideoGuid, LibraryId: VideoLibraryId }))

    return response.status(200).send('ok')
  } catch (error) {
    next(error)
  }
})

async function fetchUserCollection({ userId }: { userId: AppUserId }): Promise<string> {
  const existingCollection = await getSingleEvent<BunnyUserCollectionCreated>('BunnyUserCollectionCreated', {
    userId,
    bunnyLibraryId: process.env.BUNNY_LIBRARY_ID!,
  })

  if (!existingCollection) {
    const result = await axios.post(
      `${process.env.BUNNY_URL}/library/${process.env.BUNNY_LIBRARY_ID!}/collections`,
      { name: `${userId}` },
      {
        headers: {
          AccessKey: `${process.env.BUNNY_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )

    await addToHistory(
      BunnyUserCollectionCreated({ userId, bunnyCollectionId: result.data.guid, bunnyLibraryId: process.env.BUNNY_LIBRARY_ID! })
    )

    return result.data.guid
  }

  return existingCollection.payload.bunnyCollectionId
}

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
