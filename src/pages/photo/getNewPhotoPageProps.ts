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
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { getPhotoCaption } from '../_getPhotoCaption'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'

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
  // TODO: Check rights

  const photoExists = await doesPhotoExist({ photoId, familyId })
  if (!photoExists) throw new Error('Photo does not exist')

  const faces: PhotoFace[] = await Promise.all(
    (
      await getFacesInPhoto({ photoId })
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

  const caption = await getPhotoCaption({ photoId })

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    caption,
    faces,
  }
}
