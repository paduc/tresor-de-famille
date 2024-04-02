import { requireAuth } from '../../dependencies/authn.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { pageRouter } from '../pageRouter.js'
import { MediaListPageUrl } from './MediaListPageURL.js'
import { MediaListPage } from './MediaListPage.js'
import axios from 'axios'
import { ZodError, z } from 'zod'
import { createHash } from 'node:crypto'
import { AppUserId } from '../../domain/AppUserId.js'
import { addToHistory } from '../../dependencies/addToHistory.js'
import { BunnyUserCollectionCreated } from './BunnyUserCollectionCreated.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { BunnyMediaUploaded } from './BunnyMediaUploaded.js'
import { zIsMediaId } from '../../domain/MediaId.js'
import { MediaUploadCompleteURL } from './MediaUploadCompleteURL.js'
import { makeMediaId } from '../../libs/makeMediaId.js'
import { BunnyMediaStatusUpdated } from './BunnyMediaStatusUpdated.js'
import { GetMediaStatusURL } from './GetMediaStatusURL.js'
import { zMediaStatus } from './MediaStatus.js'
import { PrepareMediaUploadURL } from './PrepareMediaUploadURL.js'
import { BunnyMediaHookURL } from './BunnyMediaHookURL.js'

pageRouter.get(MediaListPageUrl, requireAuth(), async (request, response, next) => {
  try {
    responseAsHtml(request, response, MediaListPage({}))
  } catch (error) {
    next(error)
  }
})

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

pageRouter.get(PrepareMediaUploadURL(), requireAuth(), async (request, response) => {
  try {
    const user = request.session.user!

    const { filename } = z.object({ filename: z.string() }).parse(request.query)

    // Fetch the user's collection
    const collectionId = await fetchBunnyUserCollection({ userId: user.id })

    // Use Bunny API to create a video
    const VideoId = await createBunnyVideo({ title: filename, collectionId })

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

    const mediaId = makeMediaId()
    await addToHistory(BunnyMediaUploaded({ mediaId, userId: user.id, bunnyLibraryId: LibraryId, bunnyVideoId: VideoId }))

    response.send({ mediaId })
  } catch (error) {
    console.error((error as Error).message)
    response.status(500).send('Failed to complete media upload')
  }
})

pageRouter.get(GetMediaStatusURL(), requireAuth(), async (request, response) => {
  try {
    const { mediaId } = z.object({ mediaId: zIsMediaId }).parse(request.query)

    // 1) Get media with mediaId
    const event = await getSingleEvent<BunnyMediaUploaded>('BunnyMediaUploaded', { mediaId })

    if (!event) {
      console.error('Failed to get media from history')
      return response.send({ status: 404 })
    }
    const { bunnyVideoId, bunnyLibraryId } = event.payload

    // 2) Try to get media status from BunnyCDN
    const res = await axios.get(`${process.env.BUNNY_URL}/library/${bunnyLibraryId}/videos/${bunnyVideoId}`, {
      headers: {
        AccessKey: `${process.env.BUNNY_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (res.status !== 200) {
      console.error('Failed to get media status from BunnyCDN')
      return response.send({ status: 404 })
    }

    return response.send({ status: res.data.status })
  } catch (error) {
    console.error((error as Error).message)
    response.status(500).send('Failed to check media status')
  }
})

pageRouter.post(BunnyMediaHookURL, async (request, response, next) => {
  try {
    const { Status, VideoGuid, VideoLibraryId } = z
      .object({ Status: zMediaStatus, VideoGuid: z.string(), VideoLibraryId: z.number() })
      .parse(request.body)

    await addToHistory(BunnyMediaStatusUpdated({ Status, VideoId: VideoGuid, LibraryId: VideoLibraryId.toString() }))

    return response.status(200).send('ok')
  } catch (error) {
    next(error)
  }
})

async function fetchBunnyUserCollection({ userId }: { userId: AppUserId }): Promise<string> {
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

async function createBunnyVideo(params: { title: string; collectionId: string }) {
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
