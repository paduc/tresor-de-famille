import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { getPersonForUser } from '../_getPersonForUser.js'

import { FamilyPageProps } from './FamilyPage.js'
import { UserSetFamilyTreeOrigin } from './UserSetFamilyTreeOrigin.js'
import { getFamilyTreePersons } from './getFamilyTreePersons.js'
import { getFamilyTreeRelationships } from './getFamilyTreeRelationships.js'

export const getFamilyPageProps = async ({
  userId,
  familyId,
}: {
  userId: AppUserId
  familyId: FamilyId
}): Promise<FamilyPageProps> => {
  const personForUser = await getPersonForUser({ userId })

  const persons = await getFamilyTreePersons({ userId, familyId })
  const relationships = await getFamilyTreeRelationships(
    persons.map((p) => p.personId),
    familyId
  )

  const originForTree =
    asFamilyId(userId) === familyId
      ? personForUser?.personId
      : (await getSingleEvent<UserSetFamilyTreeOrigin>('UserSetFamilyTreeOrigin', { familyId }))?.payload.newPerson.personId

  return {
    initialPersons: persons,
    initialRelationships: relationships,
    initialOriginPersonId: originForTree,
    familyId,
  }
}

export type Relationship = FamilyPageProps['initialRelationships'][number]
