import { getSingleEvent } from '../dependencies/getSingleEvent.js'
import { FamilyId } from '../domain/FamilyId.js'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily.js'

export const getFamilyById = async (familyId: FamilyId): Promise<{ name: string; about: string }> => {
  const userCreatedFamilyEvent = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId })

  if (!userCreatedFamilyEvent) {
    throw new Error('Family does not exist')
  }

  const { familyName, about } = userCreatedFamilyEvent.payload

  return {
    name: familyName,
    about,
  }
}
