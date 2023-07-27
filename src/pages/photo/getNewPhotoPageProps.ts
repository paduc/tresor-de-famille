import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain/UUID'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { FaceIgnoredInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../bienvenue/step3-learnAboutUsersFamily/UserRecognizedPersonInPhoto'
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

  // Has a this face been named or recognized ?
  const personNamedOrRecognized = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
      userId,
    }
  )

  if (personNamedOrRecognized) {
    // Yes, the face was named or recognized
    const { type, payload } = personNamedOrRecognized
    const { personId } = payload

    let name: string
    if (type === 'UserNamedPersonInPhoto') {
      name = payload.name
    } else {
      name = (await getPersonByIdOrThrow(personId)).name
    }
  }

  // Has this face been ignored ?
  const faceIgnored = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    photoId,
    faceId,
    ignoredBy: userId,
  })

  if (faceIgnored) {
    return {
      faceId,
      stage: 'ignored',
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
