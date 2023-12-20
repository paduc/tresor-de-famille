import { getEventList } from '../dependencies/getEventList'
import { AppUserId } from '../domain/AppUserId'
import { FamilyId } from '../domain/FamilyId'
import { FamilyShareCode } from '../domain/FamilyShareCode'
import { UserRegisteredWithInvitation } from '../events/UserRegisteredWithInvitation'
import { FamilyColorCodes } from '../libs/ssr/FamilyColorCodes'
import { getFamilyById } from './_getFamilyById'
import { UserAcceptedInvitation } from './invitation/UserAcceptedInvitation'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily'

export const getUserFamilies = async (
  userId: AppUserId
): Promise<
  {
    familyId: FamilyId
    familyName: string
    about: string
    shareCode: FamilyShareCode
    isRegistrationFamily: boolean
    isCreator: boolean
    color: string
  }[]
> => {
  // Personnel space
  const userFamilies = [
    {
      familyId: userId as string as FamilyId,
      familyName: 'Votre espace Personnel',
      about: '',
      shareCode: '' as string as FamilyShareCode,
      isRegistrationFamily: false,
      isCreator: false,
    },
  ]

  const userCreatedFamilyEvents = await getEventList<UserCreatedNewFamily>('UserCreatedNewFamily', { userId })

  userFamilies.push(
    ...userCreatedFamilyEvents.map(({ payload: { familyId, familyName, about, shareCode } }) => ({
      familyId,
      familyName,
      about,
      shareCode,
      isRegistrationFamily: false,
      isCreator: true,
    }))
  )

  const acceptedInvitationEvents = await getEventList<UserAcceptedInvitation | UserRegisteredWithInvitation>(
    ['UserAcceptedInvitation', 'UserRegisteredWithInvitation'],
    { userId }
  )
  for (const acceptedInvitationEvent of acceptedInvitationEvents) {
    const { familyId, shareCode } = acceptedInvitationEvent.payload

    const family = await getFamilyById(familyId)

    if (family) {
      const { name, about } = family

      userFamilies.push({
        familyId,
        familyName: name,
        about,
        shareCode,
        isRegistrationFamily: acceptedInvitationEvent.type === 'UserRegisteredWithInvitation',
        isCreator: false,
      })
    }
  }

  return userFamilies.map((userFamily, index) => ({ ...userFamily, color: FamilyColorCodes[index + 1] }))
}
