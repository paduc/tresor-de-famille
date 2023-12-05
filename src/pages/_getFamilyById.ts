import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily'

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
