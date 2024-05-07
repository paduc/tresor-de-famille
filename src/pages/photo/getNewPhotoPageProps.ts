import { postgres } from '../../dependencies/database.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { doesPhotoExist } from '../_doesPhotoExist.js'
import { getFacesInPhoto } from '../_getFacesInPhoto.js'
import { getPersonByIdOrThrow } from '../_getPersonById.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getPhotoAuthor } from '../_getPhotoAuthor.js'
import { getPhotoFamilyId } from '../_getPhotoFamily.js'
import { getThreadAuthor } from '../_getThreadAuthor.js'
import { isThreadSharedWithUser } from '../_isThreadSharedWithUser.js'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes.js'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText.js'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage.js'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto.js'
import { getPhotoDatetime } from '../_getPhotoDatetime.js'
import { getPhotoLocation } from '../_getPhotoLocation.js'

type PhotoFace = Exclude<NewPhotoPageProps['faces'], undefined>[number]

export const getNewPhotoPageProps = async ({
  photoId,
  userId,
}: {
  photoId: PhotoId
  userId: AppUserId
}): Promise<NewPhotoPageProps> => {
  const photoExists = await doesPhotoExist({ photoId })
  if (!photoExists) throw new Error('Photo does not exist')

  const faces: NewPhotoPageProps['faces'] = await Promise.all(
    (
      await getFacesInPhoto({ photoId, userId })
    ).map(async (face): Promise<PhotoFace> => {
      const { faceId } = face

      if (face.isIgnored) {
        return {
          faceId,
          stage: 'ignored',
        }
      }

      if (face.personId) {
        const person = await getPersonByIdOrThrow({ personId: face.personId })
        return {
          faceId,
          stage: 'done',
          personId: face.personId,
          name: person.name,
        }
      }

      return { faceId, stage: 'awaiting-name' }
    })
  )

  const familyId = await getPhotoFamilyId(photoId)

  const authorId = await getPhotoAuthor(photoId)

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    familyId,
    isPhotoAuthor: authorId === userId,
    faces,
    threadsContainingPhoto: await getThreadsWithPhoto({ photoId, userId }),
    location: await getPhotoLocation({ photoId }),
    datetime: await getPhotoDatetime({ photoId }),
  }
}

async function getThreadsWithPhoto({
  photoId,
  userId,
}: {
  photoId: PhotoId
  userId: AppUserId
}): Promise<NewPhotoPageProps['threadsContainingPhoto']> {
  const { rows } = await postgres.query<UserUpdatedThreadAsRichText>(
    `SELECT * FROM history WHERE type='UserUpdatedThreadAsRichText' AND payload->>'contentAsJSON' LIKE $1 ORDER BY "occurredAt" DESC`,
    [`%${photoId}%`]
  )

  const results: NewPhotoPageProps['threadsContainingPhoto'] = []

  const uniqueThreads = new Set<ThreadId>()
  for (const row of rows) {
    const { threadId } = row.payload

    if (uniqueThreads.has(threadId)) {
      continue
    }
    uniqueThreads.add(threadId)

    if (await isThreadSharedWithUser({ threadId, userId })) {
      let authorName = 'Sans nom'
      const authorUserId = await getThreadAuthor(threadId)
      if (authorUserId) {
        const authorPerson = await getPersonForUser({ userId: authorUserId })
        if (authorPerson) {
          authorName = authorPerson.name
        }
      }

      results.push({
        title: await makeThreadTitle(row),
        threadId,
        author: {
          name: authorName,
        },
      })
    }
  }

  return results
}

async function makeThreadTitle(threadEvent: UserUpdatedThreadAsRichText): Promise<string> {
  const nodes = threadEvent.payload.contentAsJSON.content

  const textNodes = nodes.filter((node): node is ParagraphNode => node.type === 'paragraph' && !!node.content)

  if (textNodes.length) {
    const textNode = textNodes.find(
      (node) => node.content?.length && node.content.some((c) => c.type === 'text' && c.text.length)
    )

    const text = textNode?.content?.length && textNode?.content.map((c) => (c.type === 'text' ? c.text : ' ')).join('')

    if (text) {
      return text
    }
  }

  const photoNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  if (photoNodes.length) {
    const { photoId } = photoNodes[0].attrs
    const latestCaption = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId })

    if (latestCaption) {
      return latestCaption.payload.caption.body
    }
  }

  return 'Sans titre'
}
