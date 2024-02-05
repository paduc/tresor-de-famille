import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { AppUserId } from '../../domain/AppUserId'
import { PhotoId } from '../../domain/PhotoId'
import { doesPhotoExist } from '../_doesPhotoExist'
import { getFacesInPhoto } from '../_getFacesInPhoto'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPhotoAuthor } from '../_getPhotoAuthor'
import { getPhotoFamilyId } from '../_getPhotoFamily'

import { NewPhotoPageProps } from './PhotoPage/NewPhotoPage'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

type PhotoFace = Exclude<NewPhotoPageProps['faces'], undefined>[number]

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

  let faces: NewPhotoPageProps['faces'] = undefined
  const awsFacesDetectedEvent = await getSingleEvent<AWSDetectedFacesInPhoto>('AWSDetectedFacesInPhoto', {
    photoId,
  })

  if (awsFacesDetectedEvent) {
    faces = await Promise.all(
      (
        await getFacesInPhoto({ photoId, userId })
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
  }

  const familyId = await getPhotoFamilyId(photoId)

  const authorId = await getPhotoAuthor(photoId)

  return {
    photoUrl: getPhotoUrlFromId(photoId),
    photoId,
    familyId,
    isPhotoAuthor: authorId === userId,
    faces,
  }
}
