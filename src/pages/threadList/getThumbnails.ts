import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { ThreadListProps } from '../_components/ThreadList.js'
import { BunnyMediaUploaded } from '../media/BunnyMediaUploaded.js'
import { CDN } from '../photoApi/CDN.js'
import { ThumbnailURL } from '../photoApi/ThumbnailURL.js'
import { MediaNode, PhotoNode } from '../thread/TipTapTypes.js'
import { UserInsertedPhotoInRichTextThread } from '../thread/UserInsertedPhotoInRichTextThread.js'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText.js'
import { ThreadEvent } from './getThreadListPageProps.js'

type Thumbnail = ThreadListProps[number]['thumbnails'][number]
export async function getThumbnails(threadEvents: readonly ThreadEvent[]): Promise<Thumbnail[]> {
  const latestContentEvent = [...threadEvents]
    .reverse()
    .find((event: ThreadEvent): event is UserUpdatedThreadAsRichText | UserInsertedPhotoInRichTextThread =>
      ['UserUpdatedThreadAsRichText', 'UserInsertedPhotoInRichTextThread'].includes(event.type)
    )

  if (!latestContentEvent) return []

  const nodes = latestContentEvent.payload.contentAsJSON.content

  const mediaNodes = nodes.filter(
    (node): node is PhotoNode | MediaNode => node.type === 'photoNode' || node.type === 'mediaNode'
  )

  return (
    await Promise.all(
      mediaNodes.map(async (node) => {
        if (node.type === 'photoNode') {
          return { url: CDN(ThumbnailURL(node.attrs.photoId)), type: 'image' }
        }

        const bunnyVideoThumbnailURL = await getThumbnailURLForBunnyVideo(node.attrs.mediaId)
        if (bunnyVideoThumbnailURL) {
          return { url: bunnyVideoThumbnailURL, type: 'video' }
        }
      })
    )
  ).filter((thumbnail): thumbnail is Thumbnail => !!thumbnail)
}

const BUNNY_VIDEO_CDN_URL = process.env.BUNNY_VIDEO_CDN_URL
if (!BUNNY_VIDEO_CDN_URL) {
  console.error('BUNNY_VIDEO_CDN_URL is not set')
  process.exit(1)
}

async function getThumbnailURLForBunnyVideo(mediaId: string): Promise<string | null> {
  const mediaEvent = await getSingleEvent<BunnyMediaUploaded>('BunnyMediaUploaded', { mediaId })

  if (!mediaEvent) {
    return null
  }

  const { bunnyVideoId } = mediaEvent.payload

  return `${BUNNY_VIDEO_CDN_URL}/${bunnyVideoId}/thumbnail.jpg`
}
