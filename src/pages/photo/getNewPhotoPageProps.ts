import { DomainEvent } from '../../dependencies/DomainEvent'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain/UUID'
import { FaceIgnoredInPhoto } from '../../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

type PhotoFace = NewPhotoPageProps['faces'][number]

export const getNewPhotoPageProps = async ({
  photoId,
  userId,
}: {
  photoId: UUID
  userId: UUID
}): Promise<NewPhotoPageProps> => {
  const captionSet = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId })

  const facesDetected = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', { photoId })

  const detectedFaces = facesDetected?.payload.faces || []

  const faces: PhotoFace[] = detectedFaces
    ? await Promise.all(detectedFaces.map(({ faceId }) => getFamilyDetectedFace({ faceId, photoId, userId })))
    : []

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    caption: captionSet?.payload.caption.body,
    faces,
  }
}

async function getFamilyDetectedFace(args: { faceId: UUID; photoId: UUID; userId: UUID }): Promise<PhotoFace> {
  const { faceId, photoId, userId } = args

  const personNamedOrRecognizedEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
      userId,
    }
  )

  const faceIgnoredEvent = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
    ignoredBy: userId,
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
      name = (await getPersonByIdOrThrow(personId)).name
    }

    return {
      faceId,
      stage: 'done',
      personId,
      name,
    }
  }

  // Do we recognize this face from elsewhere ?
  const persons = await getPersonIdsForFaceId(faceId)
  if (persons.length) {
    const personId = persons[0]
    const person = await getPersonById(personId)

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
