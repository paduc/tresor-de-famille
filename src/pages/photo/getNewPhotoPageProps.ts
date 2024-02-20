import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'
import { EXIF } from '../../libs/exif'
import { getGPSDecCoordsFromExif } from '../../libs/getGPSDecCoordsFromExif'
import { doesPhotoExist } from '../_doesPhotoExist'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonForUser } from '../_getPersonForUser'
import { getPhotoAuthor } from '../_getPhotoAuthor'
import { getPhotoFamilyId } from '../_getPhotoFamily'
import { getThreadAuthor } from '../_getThreadAuthor'
import { isThreadSharedWithUser } from '../_isThreadSharedWithUser'
import { PhotoGPSReverseGeocodedUsingMapbox } from '../photoApi/PhotoGPSReverseGeocodedUsingMapbox'
import { UserUploadedPhoto } from '../photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from '../photoApi/UserUploadedPhotoToFamily'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { UserSetPhotoLocation } from './UserSetPhotoLocation'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

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

  let faces: NewPhotoPageProps['faces'] = undefined
  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId,
  })

  if (awsFacesDetectedEvent) {
    faces = await Promise.all(
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
  }

  const familyId = await getPhotoFamilyId(photoId)

  const authorId = await getPhotoAuthor(photoId)

  const EXIFGPSCoordsAndTime = await getEXIFGPSCoordsAndTime({ photoId })
  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    familyId,
    isPhotoAuthor: authorId === userId,
    faces,
    threadsContainingPhoto: await getThreadsWithPhoto({ photoId, userId }),
    location: await getPhotoLocation({ photoId, EXIFGPSCoords: EXIFGPSCoordsAndTime?.GPSCoords }),
    datetime: EXIFGPSCoordsAndTime?.datetime,
  }
}

async function getPhotoLocation({
  photoId,
  EXIFGPSCoords,
}: {
  photoId: PhotoId
  EXIFGPSCoords:
    | {
        lat: number
        long: number
      }
    | undefined
}): Promise<NewPhotoPageProps['location']> {
  // A reverse chronological list of events (first in array = last to be emitted)
  const photoLocationEvents = (await getEventList<UserSetPhotoLocation>('UserSetPhotoLocation', { photoId })).sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  )

  const mapboxNameFromExif = await getMapboxPlaceName({ photoId })

  if (!photoLocationEvents.length) {
    return {
      isIrrelevant: false,
      GPSCoords: {
        exif: EXIFGPSCoords,
        userOption: EXIFGPSCoords ? 'exif' : 'none',
      },
      name: {
        userProvided: '',
        mapbox: {
          exif: mapboxNameFromExif,
        },
        userOption: 'mapboxFromExif',
      },
    }
  }

  const { payload } = photoLocationEvents.at(0)!
  if (!payload.isIrrelevant) {
    return {
      isIrrelevant: false,
      GPSCoords: {
        exif: EXIFGPSCoords,
        userOption: payload.gpsOption,
      },
      name: {
        userProvided: payload.name.option === 'user' ? payload.name.locationName : '',
        mapbox: {
          exif: mapboxNameFromExif,
        },
        userOption: payload.name.option,
      },
    }
  }

  // isIrrelevant === true
  return {
    isIrrelevant: true,
    GPSCoords: {
      exif: EXIFGPSCoords,
      userOption: getLatestUserProvidedGPSOption(photoLocationEvents) || 'none',
    },
    name: {
      userProvided: getLatestUserProvidedLocationName(photoLocationEvents),
      mapbox: {
        exif: mapboxNameFromExif,
      },
      userOption: getLatestUserProvidedNameOption(photoLocationEvents) || 'none',
    },
  }
}

function getLatestUserProvidedNameOption(events: UserSetPhotoLocation[]) {
  if (!events.length) return

  for (const event of events) {
    const { payload } = event
    if (payload.isIrrelevant) continue

    return payload.name.option
  }
}

function getLatestUserProvidedGPSOption(events: UserSetPhotoLocation[]) {
  if (!events.length) return

  for (const event of events) {
    const { payload } = event
    if (payload.isIrrelevant) continue

    return payload.gpsOption
  }
}

function getLatestUserProvidedLocationName(events: UserSetPhotoLocation[]) {
  if (!events.length) return

  for (const event of events) {
    const { payload } = event

    if (payload.isIrrelevant) continue
    if (payload.name.option !== 'user') continue

    return payload.name.locationName
  }
}

async function getEXIFGPSCoordsAndTime({
  photoId,
}: {
  photoId: PhotoId
}): Promise<{ GPSCoords: { lat: number; long: number } | undefined; datetime: string | undefined } | undefined> {
  const photoUploadEvent = await getSingleEvent<UserUploadedPhoto | UserUploadedPhotoToFamily>(
    ['UserUploadedPhoto', 'UserUploadedPhotoToFamily'],
    { photoId }
  )

  if (!photoUploadEvent) return

  const { exif } = photoUploadEvent.payload

  if (!exif) return

  const GPSCoords = getGPSDecCoordsFromExif(exif)

  const datetime = getDateTimeFromExif(exif)

  return { GPSCoords, datetime }
}

async function getMapboxPlaceName({ photoId }: { photoId: PhotoId }): Promise<string | undefined> {
  const reverseGeocode = await getSingleEvent<PhotoGPSReverseGeocodedUsingMapbox>('PhotoGPSReverseGeocodedUsingMapbox', {
    photoId,
  })

  if (reverseGeocode) {
    return reverseGeocode.payload.geocode.features[0].place_name
  }
}

function getDateTimeFromExif(exif: EXIF): string | undefined {
  const dateString = exif.DateTime || exif.DateTimeOriginal

  if (!dateString || typeof dateString !== 'string') return

  // The format of DateTime in EXIF is "YYYY:MM:DD HH:MM:SS"
  // To be acceptable for a Date, we need to replace the first two ":" with "-"
  const formattedDateString = dateString.replace(':', '-').replace(':', '-')

  // Check if valid date string
  const date = new Date(formattedDateString)
  if (isNaN(date.getTime())) {
    return
  }

  return date.toISOString()
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
    const textNode = textNodes.find((node) => node.content?.length && node.content.some((c) => c.text.length))

    const text = textNode?.content?.length && textNode?.content.map((c) => c.text).join('')

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
