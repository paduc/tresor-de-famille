import { getEventList } from '../dependencies/getEventList'
import { AppUserId } from '../domain/AppUserId'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily'

export const getUserFamilies = async (userId: AppUserId) => {
  const userFamiliesEvent = await getEventList<UserCreatedNewFamily>('UserCreatedNewFamily', { userId })

  return userFamiliesEvent.map(({ payload }) => payload)
}
