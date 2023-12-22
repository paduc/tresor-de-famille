import { addToHistory } from '../dependencies/addToHistory'
import { personsIndex } from '../dependencies/search'
import { AppUserId } from '../domain/AppUserId'
import { FaceId } from '../domain/FaceId'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { PhotoId } from '../domain/PhotoId'
import { makePersonId } from '../libs/makePersonId'
import { getPersonByIdOrThrow } from './_getPersonById'
import { getPersonClones } from './_getPersonClones'
import { getPersonFamily } from './_getPersonFamily'
import { getFaceAndPhotoForPerson } from './_getProfilePicUrlForPerson'
import { PersonClonedForSharing } from './share/PersonClonedForSharing'

export async function createCloneIfOutsideOfFamily({
  personId,
  familyId,
  userId,
}: {
  personId: PersonId
  familyId: FamilyId
  userId: AppUserId
}): Promise<PersonId> {
  const personFamilyId = await getPersonFamily(personId)

  if (personFamilyId === familyId) {
    // He's part of the family, all is good
    return personId
  }

  // We have to clone the person for this family
  // Let's check if the person already has a clone in this family
  const clones = await getPersonClones({ personId })
  const cloneInFamily = clones.find((clone) => clone.familyId === familyId)

  if (cloneInFamily) {
    // A clone of this person exists in the targetted family
    // Use it
    return cloneInFamily.personId
  }

  // Create a new clone for this family
  // Use the original as the clone's origin
  const originPersonAndFamily = clones.at(0)
  if (!originPersonAndFamily) {
    throw new Error(`Cannot find the original person for ${personId}`)
  }
  const { personId: originalPersonId, familyId: originalFamilyId } = originPersonAndFamily
  const originalPerson = await getPersonByIdOrThrow({ personId: originalPersonId })

  const { faceId, profilePicPhotoId } = await fetchFaceAndPhotoForPerson({ userId, personId })

  const newClonePersonId = makePersonId()
  await addToHistory(
    PersonClonedForSharing({
      userId,
      name: originalPerson.name,
      personId: newClonePersonId,
      familyId,
      profilePicPhotoId,
      faceId,
      clonedFrom: {
        personId: originalPersonId,
        familyId: originalFamilyId,
      },
    })
  )

  try {
    await personsIndex.saveObject({
      objectID: newClonePersonId,
      personId: newClonePersonId,
      name: originalPerson.name,
      familyId,
      visible_by: [`family/${familyId}`, `user/${userId}`],
    })
  } catch (error) {
    console.error('Could not add person clone to algolia index', error)
  }

  return newClonePersonId
}

async function fetchFaceAndPhotoForPerson({
  userId,
  personId,
}: {
  userId: AppUserId
  personId: PersonId
}): Promise<{ faceId: FaceId | undefined; profilePicPhotoId: PhotoId | undefined }> {
  const faceAndPhotoForPerson = await getFaceAndPhotoForPerson({ userId, personId })
  if (faceAndPhotoForPerson) {
    const { faceId, photoId } = faceAndPhotoForPerson
    return { faceId, profilePicPhotoId: photoId }
  }

  return {
    faceId: undefined,
    profilePicPhotoId: undefined,
  }
}
