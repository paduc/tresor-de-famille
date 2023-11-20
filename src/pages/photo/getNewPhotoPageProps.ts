import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { doesPhotoExist } from '../_doesPhotoExist'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

type PhotoFace = NewPhotoPageProps['faces'][number]

export const getNewPhotoPageProps = async ({
  photoId,
  userId,
  familyId,
}: {
  photoId: PhotoId
  userId: AppUserId
  familyId: FamilyId
}): Promise<NewPhotoPageProps> => {
  const photoExists = await doesPhotoExist({ photoId, familyId })
  if (!photoExists) throw new Error('Photo does not exist')

  const captionSet = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId, familyId })

  const awsFacesDetectedEvents = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

  const detectedFaces = awsFacesDetectedEvents?.payload.faces || []

  const faces: PhotoFace[] = detectedFaces
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId, userId, familyId })))
    : []

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    caption: captionSet?.payload.caption.body,
    faces,
  }
}

// Copy from getChatPageProps()
async function getFamilyDetectedFace(args: {
  faceId: FaceId
  photoId: PhotoId
  userId: AppUserId
  familyId: FamilyId
}): Promise<PhotoFace> {
  const { faceId, photoId, userId, familyId } = args

  const personNamedOrRecognizedEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
      userId,
      familyId,
    }
  )

  const faceIgnoredEvent = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
    ignoredBy: userId,
    familyId,
  })

  type Defined = Exclude<typeof personNamedOrRecognizedEvent | typeof faceIgnoredEvent, undefined>

  const latestEvent = [personNamedOrRecognizedEvent, faceIgnoredEvent]
    .filter((event): event is Defined => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .at(-1)

  if (latestEvent) {
    if (latestEvent.type === 'FaceIgnoredInPhoto') {
      return {
        faceId,
        stage: 'ignored',
      }
    }

    const { type, payload } = latestEvent
    const { personId } = payload

    let name: string
    if (type === 'UserNamedPersonInPhoto') {
      name = payload.name
    } else {
      name = (await getPersonByIdOrThrow({ personId, familyId })).name
    }

    return {
      faceId,
      stage: 'done',
      personId,
      name,
    }
  }

  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId({ faceId, userId, familyId })
  if (persons.length) {
    const personId = persons[0]
    const person = await getPersonById({ personId, familyId })

    if (person) {
      return {
        faceId,
        stage: 'done',
        personId,
        name: person.name,
      }
    }
  }

  return {
    faceId,
    stage: 'awaiting-name',
  }
}
