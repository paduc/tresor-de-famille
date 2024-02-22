import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { PhotoId } from '../domain/PhotoId'
import { getGPSDecCoordsFromExif } from '../libs/getGPSDecCoordsFromExif'
import { PhotoGPSReverseGeocodedUsingMapbox } from './photoApi/PhotoGPSReverseGeocodedUsingMapbox'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily'
import { NewPhotoPageProps } from './photo/PhotoPage/NewPhotoPage'
import { UserSetPhotoLocation } from './photo/UserSetPhotoLocation'

export async function getPhotoLocation({ photoId }: { photoId: PhotoId }): Promise<NewPhotoPageProps['location']> {
  // A reverse chronological list of events (first in array = last to be emitted)
  const photoLocationEvents = (await getEventList<UserSetPhotoLocation>('UserSetPhotoLocation', { photoId })).sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  )

  const EXIFGPSCoords = await getEXIFGPSCoords({ photoId })

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

async function getEXIFGPSCoords({ photoId }: { photoId: PhotoId }): Promise<{ lat: number; long: number } | undefined> {
  const photoUploadEvent = await getSingleEvent<UserUploadedPhoto | UserUploadedPhotoToFamily>(
    ['UserUploadedPhoto', 'UserUploadedPhotoToFamily'],
    { photoId }
  )

  if (!photoUploadEvent) return

  const { exif } = photoUploadEvent.payload

  if (!exif) return

  return getGPSDecCoordsFromExif(exif)
}

async function getMapboxPlaceName({ photoId }: { photoId: PhotoId }): Promise<string | undefined> {
  const reverseGeocode = await getSingleEvent<PhotoGPSReverseGeocodedUsingMapbox>('PhotoGPSReverseGeocodedUsingMapbox', {
    photoId,
  })

  if (reverseGeocode) {
    return reverseGeocode.payload.geocode.features[0].place_name
  }
}
