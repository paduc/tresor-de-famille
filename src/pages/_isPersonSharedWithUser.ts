import { getEventList } from '../dependencies/getEventList'
import { AppUserId } from '../domain/AppUserId'
import { PersonId } from '../domain/PersonId'
import { getUserFamilies } from './_getUserFamilies'
import { PersonAutoShareWithFamilyCreation } from './share/PersonAutoShareWithFamilyCreation'
import { PersonAutoSharedWithPhotoFace } from './share/PersonAutoSharedWithPhotoFace'
import { PersonAutoSharedWithRelationship } from './share/PersonAutoSharedWithRelationship'

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
