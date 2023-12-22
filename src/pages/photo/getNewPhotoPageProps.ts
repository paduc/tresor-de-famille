import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { PhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPhotoCaption } from '../_getPhotoCaption'
import { getPhotoFamilyId } from '../_getPhotoFamily'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'

type PhotoFace = NewPhotoPageProps['faces'][number]

export const getNewPhotoPageProps = async ({
  photoId,
  userId,
}: {
  photoId: PhotoId
  userId: AppUserId
}): Promise<NewPhotoPageProps> => {
  // TODO: Check rights

  const photoExists = await doesPhotoExist({ photoId })
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

  const familyId = await getPhotoFamilyId(photoId)

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    familyId,
    caption,
    faces,
  }
}
