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
import { getOriginalPersonFamily } from '../_getOriginalPersonFamily'
import { getPhotoFamilyId } from '../_getPhotoFamily'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated'
import { PersonPageProps } from './PersonPage'

export const getPersonPageProps = async ({
  personId,
  userId,
}: {
  personId: PersonId
  userId: AppUserId
}): Promise<PersonPageProps> => {
  const { name } = (await getPersonById({ personId })) || { name: 'N/A' }
  const personFamilyId = await getOriginalPersonFamily(personId)

  // const userFamilies = (await getUserFamilies(userId))
  // const shareFamilies = await getFamiliesWithAccessToPerson({ personId })
  // const sharedWithFamilies = []
  // for (const familyId of shareFamilies) {
  //   if (familyId === personFamilyId) continue

  //   // Ne retenir que les familles
  //   const family = userFamilies.find(uf => uf.familyId === familyId)
  //   const familyName = family?.familyName || '' // Don't display family name for

  //   sharedWithFamilies.push({
  //     familyId,
  //     familyName,
  //   })
  // }

  const { photos, alternateProfilePics } = await getPersonPhotos(personId, personFamilyId)

  let familyName: string
  if (!personFamilyId || (personFamilyId as string) === (userId as string)) {
    familyName = 'Espace personnel'
  } else {
    const family = await getFamilyById(personFamilyId)
    familyName = family.name
  }

  const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })

  return {
    person: { personId, name, profilePicUrl, familyName, familyId: personFamilyId },
    photos,
    alternateProfilePics,
    sharedWithFamilies: [],
  }
}

async function getPersonPhotos(
  personId: PersonId,
  familyId: FamilyId
): Promise<Pick<PersonPageProps, 'photos' | 'alternateProfilePics'>> {
  // 1) Get all faces for the personId (in PersonCloned, 'PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace')
  // -> personId => personFacesIds: FaceId[]

  const personFaceEvents = await getEventList<
    PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
  >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
    personId,
  })

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
    }
  }

  // Filter the deleted photos
  const { rows: deletedPhotosIds } = await postgres.query<{ photoId: PhotoId }>(
    "SELECT payload->>'photoId' AS \"photoId\" from history where type='UserDeletedPhoto' and payload->>'photoId' = ANY ($1);",
    [Array.from(photosInFamily)]
  )
  const uniqueDeletedPhotoIds = new Set(deletedPhotosIds.map((e) => e.photoId))

  const nonDeletedPhotosInFamily = Array.from(photosInFamily).filter((photoId) => !uniqueDeletedPhotoIds.has(photoId))

  // return the photos in the family containing the face of the person
  return {
    photos: nonDeletedPhotosInFamily.map((photoId) => ({ photoId, url: getPhotoUrlFromId(photoId) })),
    alternateProfilePics,
  }
}
