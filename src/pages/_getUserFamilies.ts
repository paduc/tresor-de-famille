import { getEventList } from '../dependencies/getEventList'
import { getSingleEvent } from '../dependencies/getSingleEvent'
import { AppUserId } from '../domain/AppUserId'
import { FamilyId } from '../domain/FamilyId'
import { FamilyShareCode } from '../domain/FamilyShareCode'
import { UserAcceptedInvitation } from './invitation/UserAcceptedInvitation'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily'

export const getUserFamilies = async (
  userId: AppUserId
): Promise<{ familyId: FamilyId; familyName: string; about: string; shareCode: FamilyShareCode }[]> => {
  const userCreatedFamilyEvents = await getEventList<UserCreatedNewFamily>('UserCreatedNewFamily', { userId })

  const userCreatedFamilies = userCreatedFamilyEvents.map(({ payload: { familyId, familyName, about, shareCode } }) => ({
    familyId,
    familyName,
    about,
    shareCode,
  }))

  const userFamilies = [...userCreatedFamilies]

  const acceptedInvitationEvents = await getEventList<UserAcceptedInvitation>('UserAcceptedInvitation', { userId })
  for (const acceptedInvitationEvent of acceptedInvitationEvents) {
    const { familyId } = acceptedInvitationEvent.payload

    const familyInfoEvent = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId })

    if (familyInfoEvent) {
      const {
        payload: { familyName, about, shareCode },
      } = familyInfoEvent
      userFamilies.push({ familyId, familyName, about, shareCode })
    }
  }

  return userFamilies
}
