import { getEventList } from '../dependencies/getEventList.js'
import { FamilyId } from '../domain/FamilyId.js'
import { PersonId } from '../domain/PersonId.js'
import { getOriginalPersonFamily } from './_getOriginalPersonFamily.js'
import { PersonAutoShareWithFamilyCreation } from './share/PersonAutoShareWithFamilyCreation.js'
import { PersonAutoSharedWithPhotoFace } from './share/PersonAutoSharedWithPhotoFace.js'
import { PersonAutoSharedWithRelationship } from './share/PersonAutoSharedWithRelationship.js'

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
