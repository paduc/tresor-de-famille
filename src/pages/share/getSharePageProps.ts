import { getEventList } from '../../dependencies/getEventList.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword.js'
import { UserRegisteredWithInvitation } from '../../events/UserRegisteredWithInvitation.js'
import { asFamilyId } from '../../libs/typeguards.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getUserFamilies } from '../_getUserFamilies.js'
import { UserAcceptedInvitation } from '../invitation/UserAcceptedInvitation.js'
import { InvitationWithCodeUrl } from './InvitationWithCodeUrl.js'
import { SharePageProps } from './SharePage.js'
import { UserCreatedNewFamily } from './UserCreatedNewFamily.js'

export const getSharePageProps = async (userId: AppUserId): Promise<SharePageProps> => {
  const userFamilies = await getUserFamilies(userId)

  const usersByFamilyId = new Map<FamilyId, { userId: AppUserId; partialEmail: string; name: string }[]>()

  for (const userFamily of userFamilies) {
    const { familyId } = userFamily
    // ignore the userspace
    if (familyId === asFamilyId(userId)) continue

    const usersInFamily = await getUsersInFamily(familyId)
    usersByFamilyId.set(familyId, usersInFamily)
  }

  return {
    userFamilies: userFamilies.map(({ familyId, familyName, shareCode, about }) => {
      return {
        familyId,
        name: familyName,
        about,
        shareUrl: InvitationWithCodeUrl({ familyId, code: shareCode, invitedBy: userId }),
        isUserSpace: (familyId as string) === (userId as string),
        users: usersByFamilyId.get(familyId)!,
      }
    }),
  }
}

async function getUsersInFamily(familyId: FamilyId) {
  const userInFamily: { userId: AppUserId; partialEmail: string; name: string }[] = []

  const usersInFamilyEvent = await getEventList<UserCreatedNewFamily | UserAcceptedInvitation | UserRegisteredWithInvitation>(
    ['UserCreatedNewFamily', 'UserAcceptedInvitation', 'UserRegisteredWithInvitation'],
    { familyId }
  )

  for (const userInFamilyEvent of usersInFamilyEvent) {
    const { userId } = userInFamilyEvent.payload
    const person = await getPersonForUser({ userId })
    const name = person?.name || 'Utilisateur sans nom'

    if (userInFamilyEvent.type === 'UserRegisteredWithInvitation') {
      const { email } = userInFamilyEvent.payload

      userInFamily.push({
        userId,
        partialEmail: email,
        name,
      })
    } else {
      const registrationEvent = await getSingleEvent<UserRegisteredWithEmailAndPassword>('UserRegisteredWithEmailAndPassword', {
        userId,
      })

      if (!registrationEvent) continue

      const { email } = registrationEvent.payload
      userInFamily.push({
        userId,
        partialEmail: email,
        name,
      })
    }
  }

  return userInFamily
}
