import { getEventList } from '../dependencies/getEventList.js'
import { AppUserId } from '../domain/AppUserId.js'
import { FamilyId } from '../domain/FamilyId.js'
import { FamilyShareCode } from '../domain/FamilyShareCode.js'
import { UserRegisteredWithInvitation } from '../events/UserRegisteredWithInvitation.js'
import { FamilyColorCodes } from '../libs/ssr/FamilyColorCodes.js'
import { asFamilyId } from '../libs/typeguards.js'
import { getFamilyById } from './_getFamilyById.js'
import { UserAcceptedInvitation } from './invitation/UserAcceptedInvitation.js'
import { UserCreatedNewFamily } from './share/UserCreatedNewFamily.js'

type Family = {
  familyId: FamilyId
  familyName: string
  about: string
  shareCode: FamilyShareCode
  isRegistrationFamily: boolean
  isCreator: boolean
  color: string
}

/**
 * getUserFamilies (including his own space)
 * @param userId
 * @returns a list of unique families, including the user default family
 */
export const getUserFamilies = async (userId: AppUserId): Promise<Family[]> => {
  // Personnel space
  const userFamilies = new Map<FamilyId, Family>()

  userFamilies.set(asFamilyId(userId), {
    familyId: asFamilyId(userId),
    familyName: 'Votre espace Personnel',
    about: '',
    shareCode: '' as string as FamilyShareCode,
    isRegistrationFamily: false,
    isCreator: false,
    color: '',
  })

  const userCreatedFamilyEvents = await getEventList<UserCreatedNewFamily>('UserCreatedNewFamily', { userId })

  for (const {
    payload: { familyId, familyName, about, shareCode },
  } of userCreatedFamilyEvents) {
    userFamilies.set(familyId, {
      familyId,
      familyName,
      about,
      shareCode,
      isRegistrationFamily: false,
      isCreator: true,
      color: '',
    })
  }

  const acceptedInvitationEvents = await getEventList<UserAcceptedInvitation | UserRegisteredWithInvitation>(
    ['UserAcceptedInvitation', 'UserRegisteredWithInvitation'],
    { userId }
  )
  for (const acceptedInvitationEvent of acceptedInvitationEvents) {
    const { familyId, shareCode } = acceptedInvitationEvent.payload

    if (userFamilies.has(familyId)) {
      continue
    }

    const family = await getFamilyById(familyId)

    if (family) {
      const { name, about } = family
      userFamilies.set(familyId, {
        familyId,
        familyName: name,
        about,
        shareCode,
        isRegistrationFamily: acceptedInvitationEvent.type === 'UserRegisteredWithInvitation',
        isCreator: false,
        color: '',
      })
    }
  }

  return Array.from(userFamilies).map(([_, userFamily], index) => ({ ...userFamily, color: FamilyColorCodes[index + 1] }))
}
