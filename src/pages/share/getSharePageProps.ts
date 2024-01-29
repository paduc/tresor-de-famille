import { getEventList } from '../../dependencies/getEventList'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { UserRegisteredWithInvitation } from '../../events/UserRegisteredWithInvitation'
import { asFamilyId } from '../../libs/typeguards'
import { getPersonForUser } from '../_getPersonForUser'
import { getUserFamilies } from '../_getUserFamilies'
import { UserAcceptedInvitation } from '../invitation/UserAcceptedInvitation'
import { InvitationWithCodeUrl } from './InvitationWithCodeUrl'
import { SharePageProps } from './SharePage'
import { UserCreatedNewFamily } from './UserCreatedNewFamily'

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
        shareUrl: InvitationWithCodeUrl(familyId, shareCode),
        isUserSpace: (familyId as string) === (userId as string),
        users: usersByFamilyId.get(familyId)!,
      }
    }),
  }
}

async function getUsersInFamily(familyId: FamilyId) {
  const userInFamily = []

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
