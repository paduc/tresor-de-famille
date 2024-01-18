import { getEventList } from '../dependencies/getEventList'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { getOriginalPersonFamily } from './_getOriginalPersonFamily'
import { PersonAutoSharedWithPhotoFace } from './share/PersonAutoSharedWithPhotoFace'

export async function getFamiliesWithAccessToPerson({ personId }: { personId: PersonId }): Promise<FamilyId[]> {
  const familyIds = new Set<FamilyId>()

  familyIds.add(await getOriginalPersonFamily(personId))

  const shareEvents = await getEventList<PersonAutoSharedWithPhotoFace | PersonAutoSharedWithPhotoFace>(
    ['PersonAutoSharedWithPhotoFace', 'PersonAutoSharedWithPhotoFace'],
    { personId }
  )

  for (const shareEvent of shareEvents) {
    familyIds.add(shareEvent.payload.familyId)
  }

  return Array.from(familyIds)
}
