import { getEventList } from '../dependencies/getEventList'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'
import { getOriginalPersonFamily } from './_getOriginalPersonFamily'
import { PersonAutoShareWithFamilyCreation } from './share/PersonAutoShareWithFamilyCreation'
import { PersonAutoSharedWithPhotoFace } from './share/PersonAutoSharedWithPhotoFace'
import { PersonAutoSharedWithRelationship } from './share/PersonAutoSharedWithRelationship'

export async function isPersonSharedWithFamily({
  personId,
  familyId,
}: {
  personId: PersonId
  familyId: FamilyId
}): Promise<boolean> {
  const originalFamilyId = await getOriginalPersonFamily(personId)

  if (originalFamilyId === familyId) {
    return true
  }

  const shareEvents = await getEventList<
    PersonAutoSharedWithPhotoFace | PersonAutoSharedWithRelationship | PersonAutoShareWithFamilyCreation
  >(['PersonAutoSharedWithPhotoFace', 'PersonAutoSharedWithRelationship', 'PersonAutoShareWithFamilyCreation'], { personId })

  for (const shareEvent of shareEvents) {
    if (shareEvent.payload.familyId === familyId) {
      return true
    }
  }

  return false
}
