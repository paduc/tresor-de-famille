import { postgres } from '../../dependencies/database'
import { getEventList } from '../../dependencies/getEventList'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace'
import { getPersonById } from '../_getPersonById'

import { AppUserId } from '../../domain/AppUserId'
import { FaceId } from '../../domain/FaceId'
import { FamilyId } from '../../domain/FamilyId'
import { PersonId } from '../../domain/PersonId'
import { PhotoId } from '../../domain/PhotoId'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto'
import { getFamilyById } from '../_getFamilyById'
import { getPersonClones } from '../_getPersonClones'
import { getPersonFamily } from '../_getPersonFamily'
import { getPhotoClones } from '../_getPhotoClones'
import { getPhotoFamilyId } from '../_getPhotoFamily'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'
import { getUserFamilies } from '../_getUserFamilies'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { PersonClonedForSharing } from '../share/PersonClonedForSharing'
import { PersonPageProps } from './PersonPage'

export const getPersonPageProps = async ({
  personId,
  userId,
}: {
  personId: PersonId
  userId: AppUserId
}): Promise<PersonPageProps> => {
  // const { photos, alternateProfilePics } = await getPersonPhotos(personId, userId)

  const { name } = (await getPersonById({ personId })) || { name: 'N/A' }

  const personFamilyId = await getPersonFamily(personId)

  const { photos, alternateProfilePics } = await getPersonPhotos(personId, personFamilyId)

  let familyName: string
  if (!personFamilyId || (personFamilyId as string) === (userId as string)) {
    familyName = 'Espace personnel'
  } else {
    const family = await getFamilyById(personFamilyId)
    familyName = family.name
  }

  const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })

  const clones = await getPersonClonesForUser(personId, userId)

  return {
    person: { personId, name, profilePicUrl, familyName, familyId: personFamilyId },
    photos,
    alternateProfilePics,
    clones,
  }
}

async function getPersonClonesForUser(personId: PersonId, userId: AppUserId) {
  const personClones = await getPersonClones({ personId })
  const userFamilies = await getUserFamilies(userId)
  const clones = personClones
    .filter((clone) => clone.personId !== personId)
    .reduce((clones, { personId, familyId: cloneFamilyId }) => {
      // Only keep the clones that are in one of the users families
      const userFamily = userFamilies.find((uf) => cloneFamilyId === uf.familyId)
      if (userFamily) {
        return clones.concat([{ personId, familyName: userFamily.familyName }])
      }

      if ((cloneFamilyId as string) === (userId as string)) {
        return clones.concat([{ personId, familyName: 'Espace Personnel' }])
      }

      return clones
    }, [] as PersonPageProps['clones'])
  return clones
}

async function getPersonPhotos(
  personId: PersonId,
  familyId: FamilyId
): Promise<Pick<PersonPageProps, 'photos' | 'alternateProfilePics'>> {
  // 1) Get all faces for the personId (in PersonCloned, 'PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace')
  // -> personId => personFacesIds: FaceId[]

  const personFaceEvents = await getEventList<
    | PersonClonedForSharing
    | PhotoManuallyAnnotated
    | UserRecognizedPersonInPhoto
    | UserNamedPersonInPhoto
    | UserConfirmedHisFace
  >(
    [
      'PersonClonedForSharing',
      'PhotoManuallyAnnotated',
      'UserRecognizedPersonInPhoto',
      'UserNamedPersonInPhoto',
      'UserConfirmedHisFace',
    ],
    {
      personId,
    }
  )

  // TODO: handle the case when PersonCloned can have multiple faceIds

  const personFaceIds = new Set(
    personFaceEvents.map((event) => event.payload.faceId).filter((faceId): faceId is FaceId => !!faceId)
  )

  // 2) Get all photos with faces (in AWSDetected*)
  // -> personFaceIds => photosWithFaces: PhotoId[]
  const { rows: photosWithFaces } = await postgres.query<{ photoId: PhotoId; faces: { faceId: FaceId }[] }>(
    "SELECT payload->>'photoId' AS \"photoId\", payload->'faces' AS faces from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
    [Array.from(personFaceIds)]
  )

  const alternateProfilePics: {
    faceId: FaceId
    photoId: PhotoId
    url: string
  }[] = []
  function findAndAddProfilePics(photoId: PhotoId, faces: { faceId: FaceId }[]) {
    const face = faces.find((face) => personFaceIds.has(face.faceId))
    if (face) {
      const { faceId } = face
      alternateProfilePics.push({ faceId, photoId, url: `/photo/${photoId}/face/${faceId}` })
    }
  }

  // 3) Filter to get photos in person family
  // For each photo,
  const photosInFamily = new Set<PhotoId>()
  for (const { photoId, faces } of photosWithFaces) {
    // 3.1) Get the family
    const photoFamilyId = await getPhotoFamilyId(photoId)
    if (photoFamilyId === familyId) {
      photosInFamily.add(photoId)
      findAndAddProfilePics(photoId, faces)
    } else {
      // and if not in family
      // 3.2) Get clone in the family (possibly none)
      const clones = await getPhotoClones({ photoId })
      const cloneInFamily = clones.find((clone) => clone.familyId === familyId)
      if (cloneInFamily) {
        photosInFamily.add(cloneInFamily.photoId)
        findAndAddProfilePics(photoId, faces)
      }
    }
  }

  // Filter the deleted photos
  const { rows: deletedPhotosIds } = await postgres.query<PhotoId>(
    "SELECT payload->>'photoId' from history where type='UserDeletedPhoto' and payload->>'photoId' = ANY ($1);",
    [Array.from(photosInFamily)]
  )
  const uniqueDeletedPhotoIds = new Set(deletedPhotosIds)

  const nonDeletedPhotosInFamily = Array.from(photosInFamily).filter((photoId) => !uniqueDeletedPhotoIds.has(photoId))

  // return the photos in the family containing the face of the person
  return {
    photos: nonDeletedPhotosInFamily.map((photoId) => ({ photoId, url: getPhotoUrlFromId(photoId) })),
    alternateProfilePics,
  }
}
