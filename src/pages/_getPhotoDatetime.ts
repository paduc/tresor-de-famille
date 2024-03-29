import { getEventList } from '../dependencies/getEventList.js'
import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { PhotoId } from '../domain/PhotoId.js'
import { UserUploadedPhoto } from './photoApi/UserUploadedPhoto.js'
import { UserUploadedPhotoToFamily } from './photoApi/UserUploadedPhotoToFamily.js'
import { NewPhotoPageProps } from './photo/PhotoPage/NewPhotoPage.js'
import { UserSetPhotoDate } from './photo/UserSetPhotoDate.js'

export async function getPhotoDatetime({ photoId }: { photoId: PhotoId }): Promise<NewPhotoPageProps['datetime']> {
  // A reverse chronological list of events (first in array = last to be emitted)
  const dateEvents = (await getEventList<UserSetPhotoDate>('UserSetPhotoDate', { photoId })).sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  )

  const EXIFDatetime = await getEXIFDateTime({ photoId })

  const firstEvent = dateEvents.at(0)

  return {
    userOption: firstEvent?.payload.dateOption || (!!EXIFDatetime && 'exif') || 'none',
    userProvided: getLatestUserProvidedDateAsText(dateEvents),
    exifDatetime: EXIFDatetime,
  }
}

async function getEXIFDateTime({ photoId }: { photoId: PhotoId }): Promise<string | undefined> {
  const photoUploadEvent = await getSingleEvent<UserUploadedPhoto | UserUploadedPhotoToFamily>(
    ['UserUploadedPhoto', 'UserUploadedPhotoToFamily'],
    { photoId }
  )

  if (!photoUploadEvent) return

  const { exif } = photoUploadEvent.payload

  if (!exif) return

  const dateString = exif.DateTimeOriginal

  if (!dateString || typeof dateString !== 'string') return

  // The format of DateTimeOriginal in EXIF is "YYYY:MM:DD hh:mm:ss"
  // To be acceptable for a Date, we need to replace the first two ":" with "-"
  const formattedDateString = dateString.replace(':', '-').replace(':', '-')

  // Check if valid date string
  const date = new Date(formattedDateString)
  if (isNaN(date.getTime())) {
    return
  }

  return date.toISOString()
}

function getLatestUserProvidedDateAsText(events: UserSetPhotoDate[]) {
  if (!events.length) return

  for (const event of events) {
    const { payload } = event
    if (payload.dateOption !== 'user') continue

    return payload.dateAsText
  }
}
