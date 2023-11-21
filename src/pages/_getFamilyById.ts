import { getSingleEvent } from '../dependencies/getSingleEvent'
import { FamilyId } from '../domain/FamilyId'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily'

export const getFamilyById = async (familyId: FamilyId): Promise<{ name: string; about: string } | null> => {
  const userCreatedFamilyEvent = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId })

  if (!userCreatedFamilyEvent) {
    return null
  }

  const { familyName, about } = userCreatedFamilyEvent.payload

  return {
    name: familyName,
    about,
  }
}
