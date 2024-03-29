import { getEventList } from '../dependencies/getEventList.js'
import { AppUserId } from '../domain/AppUserId.js'
import { PersonId } from '../domain/PersonId.js'
import { getUserFamilies } from './_getUserFamilies.js'
import { PersonAutoShareWithFamilyCreation } from './share/PersonAutoShareWithFamilyCreation.js'
import { PersonAutoSharedWithPhotoFace } from './share/PersonAutoSharedWithPhotoFace.js'
import { PersonAutoSharedWithRelationship } from './share/PersonAutoSharedWithRelationship.js'

export async function isPersonSharedWithUser({
  personId,
  userId,
}: {
  personId: PersonId
  userId: AppUserId
}): Promise<boolean> {
  const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

  const shareEvents = await getEventList<
    PersonAutoSharedWithPhotoFace | PersonAutoSharedWithRelationship | PersonAutoShareWithFamilyCreation
  >(['PersonAutoSharedWithPhotoFace', 'PersonAutoSharedWithRelationship', 'PersonAutoShareWithFamilyCreation'], { personId })

  for (const shareEvent of shareEvents) {
    if (userFamilyIds.includes(shareEvent.payload.familyId)) {
      return true
    }
  }

  return false
}
