import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { FaceIgnoredInPhoto } from '../events/onboarding/FaceIgnoredInPhoto'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto'
import { getPhotoFamilyId } from './_getPhotoFamily'
import { AWSDetectedFacesInPhoto } from './photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

export async function getFacesInPhoto({ photoId }: { photoId: PhotoId }): Promise<FaceInfoForPhotoInFamily[]> {
  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId,
  })

  const awsDetectedFaces = awsFacesDetectedEvent?.payload.faces || []

  const detectedFaceIds = awsDetectedFaces.map((awsFace) => awsFace.faceId)

  const photoFamilyId = await getPhotoFamilyId(photoId)

  return Promise.all(
    detectedFaceIds.map((faceId) =>
      getFaceInfoForPhotoInFamily({
        faceId,
        photoId,
        familyId: photoFamilyId,
      })
    )
  )
}

type FaceInfoForPhotoInFamily = { faceId: FaceId; personId?: PersonId | undefined; isIgnored?: boolean | undefined }

async function getFaceInfoForPhotoInFamily({
  faceId,
  photoId,
  familyId,
}: {
  faceId: FaceId
  photoId: PhotoId
  familyId: FamilyId
}): Promise<FaceInfoForPhotoInFamily> {
  // 1) Look for latest face events on this photoId (ie in this family)
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
  return { faceId }
}
