import { postgres } from '../dependencies/database'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { PhotoId } from '../domain/PhotoId'
import { getPhotoFamilyId } from './_getPhotoFamily'
import { PhotoClonedForSharing } from './thread/ThreadPage/PhotoClonedForSharing'

type PhotoAndFamily = {
  photoId: PhotoId
  familyId: FamilyId
}

/**
 * Get all the clones of a person by photoId
 * @param { photoId }
 * @returns List of persondId including the photoId
 */
export const getPhotoClones = async ({ photoId }: { photoId: PhotoId }): Promise<PhotoAndFamily[]> => {
  const personFamily = await getPhotoFamilyId(photoId)
  const originalPhotoId = await getOriginalPhotoId(photoId, personFamily)

  return [originalPhotoId, ...(await getClones(originalPhotoId.photoId))]
}

async function getOriginalPhotoId(photoId: PhotoId, familyId: FamilyId): Promise<PhotoAndFamily> {
  const isPhotoAClone = await getSingleEvent<PhotoClonedForSharing>('PhotoClonedForSharing', { photoId })

  if (isPhotoAClone) {
    return getOriginalPhotoId(isPhotoAClone.payload.clonedFrom.photoId, isPhotoAClone.payload.clonedFrom.familyId)
  }

  return { photoId, familyId }
}

async function getClones(photoId: PhotoId): Promise<PhotoAndFamily[]> {
  const { rows: clonedEvents } = await postgres.query<PhotoClonedForSharing>(
    `SELECT * FROM history WHERE type='PhotoClonedForSharing' AND payload->'clonedFrom'->>'photoId'=$1`,
    [photoId]
  )

  const clones: PhotoAndFamily[] = []

  for (const clonedEvent of clonedEvents) {
    const clonePhotoId = clonedEvent.payload.photoId
    const cloneFamilyId = clonedEvent.payload.familyId

    clones.push({ photoId: clonePhotoId, familyId: cloneFamilyId })
    clones.push(...(await getClones(clonePhotoId)))
  }

  return clones
}
