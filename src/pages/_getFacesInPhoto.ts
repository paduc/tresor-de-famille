import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { FaceIgnoredInPhoto } from '../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { getOriginalPhotoId } from './_getOriginalPhotoId'
import { AWSDetectedFacesInPhoto } from './photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

export async function getFacesInPhoto({ photoId }: { photoId: PhotoId }) {
  const originalPhotoId = await getOriginalPhotoId(photoId)

  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId: originalPhotoId,
  })

  const awsDetectedFaces = awsFacesDetectedEvent?.payload.faces || []

  const detectedFaceIds = awsDetectedFaces.map((awsFace) => awsFace.faceId)

  const detectedFaceInfo = await Promise.all(detectedFaceIds.map((faceId) => getFaceInfoForPhotoInFamily({ faceId, photoId })))

  return detectedFaceInfo
}

type FaceInfoForPhotoInFamily = PhotoClonedForSharing['payload']['faces'][number]

async function getFaceInfoForPhotoInFamily({
  faceId,
  photoId,
}: {
  faceId: FaceId
  photoId: PhotoId
}): Promise<FaceInfoForPhotoInFamily> {
  const personNamedOrRecognizedEvent = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
      photoId,
    }
  )

  const faceIgnoredEvent = await getSingleEvent<FaceIgnoredInPhoto>('FaceIgnoredInPhoto', {
    faceId,
    photoId,
  })

  type Defined = Exclude<typeof personNamedOrRecognizedEvent | typeof faceIgnoredEvent, undefined>

  const latestEvent = [personNamedOrRecognizedEvent, faceIgnoredEvent]
    .filter((event): event is Defined => !!event)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
    .at(-1)

  if (latestEvent) {
    switch (latestEvent.type) {
      case 'FaceIgnoredInPhoto':
        return { faceId, isIgnored: true }
      case 'UserRecognizedPersonInPhoto':
      case 'UserNamedPersonInPhoto':
        return { faceId, personId: latestEvent.payload.personId }
    }
  }

  const photoClonedEvent = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })
  if (photoClonedEvent) {
    const faceInfoInCloneEvent = photoClonedEvent.payload.faces.find((face) => face.faceId === faceId)
    if (faceInfoInCloneEvent) return faceInfoInCloneEvent
  }

  return { faceId }
}
