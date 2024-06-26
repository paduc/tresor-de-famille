import { getEventList } from '../dependencies/getEventList.js'
import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { AppUserId } from '../domain/AppUserId.js'
import { FaceId } from '../domain/FaceId.js'
import { PersonId } from '../domain/PersonId.js'
import { PhotoId } from '../domain/PhotoId.js'
import { FaceIgnoredInPhoto } from '../events/onboarding/FaceIgnoredInPhoto.js'
import { UserNamedPersonInPhoto } from '../events/onboarding/UserNamedPersonInPhoto.js'
import { UserRecognizedPersonInPhoto } from '../events/onboarding/UserRecognizedPersonInPhoto.js'
import { isPersonSharedWithUser } from './_isPersonSharedWithUser.js'
import { AWSDetectedFacesInPhoto } from './photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto.js'

export async function getFacesInPhoto({
  photoId,
  userId,
}: {
  photoId: PhotoId
  userId: AppUserId
}): Promise<FaceInfoForPhotoInFamily[]> {
  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId,
  })

  if (!awsFacesDetectedEvent) return []

  const awsDetectedFaces = awsFacesDetectedEvent.payload.faces

  awsDetectedFaces.sort((a, b) => (a.position.Left || 0) - (b.position.Left || 0))

  const detectedFaceIds = new Set(awsDetectedFaces.map((awsFace) => awsFace.faceId))

  return Promise.all(
    Array.from(detectedFaceIds).map((faceId) =>
      getFaceInfoForPhoto({
        faceId,
        photoId,
        userId,
      })
    )
  )
}

type FaceInfoForPhotoInFamily = { faceId: FaceId; personId?: PersonId | undefined; isIgnored?: boolean | undefined }

async function getFaceInfoForPhoto({
  faceId,
  photoId,
  userId,
}: {
  faceId: FaceId
  photoId: PhotoId
  userId: AppUserId
}): Promise<FaceInfoForPhotoInFamily> {
  // 1) Look for latest face events on this photo
  const faceRecognizedInThisPhoto = await getSingleEvent<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
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

  type Defined = Exclude<typeof faceRecognizedInThisPhoto | typeof faceIgnoredEvent, undefined>

  const latestEvent = [faceRecognizedInThisPhoto, faceIgnoredEvent]
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

  // Check if we can spot a face elsewhere
  const faceRecognizedAnywhere = await getEventList<UserNamedPersonInPhoto | UserRecognizedPersonInPhoto>(
    ['UserNamedPersonInPhoto', 'UserRecognizedPersonInPhoto'],
    {
      faceId,
    }
  )
  if (faceRecognizedAnywhere.length) {
    for (const event of faceRecognizedAnywhere) {
      const personId = event.payload.personId
      if (await isPersonSharedWithUser({ personId, userId })) {
        return { faceId, personId }
      }
    }
  }

  return { faceId }
}
