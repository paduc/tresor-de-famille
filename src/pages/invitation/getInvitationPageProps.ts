import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily.js'
import { InvitationPageProps } from './InvitationPage.js'

export const getInvitationPageProps = async ({
  familyId,
  code,
  invitedBy,
}: {
  familyId: FamilyId
  code: FamilyShareCode
  invitedBy: AppUserId | undefined
}): Promise<InvitationPageProps> => {
  const invitation = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId, shareCode: code })

  if (!invitation) {
    throw new Error('Invitation incomplète ou erronée.')
  }

  const { familyName: name, about, userId } = invitation.payload

  let creatorName = "Quelqu'un"
  try {
    const person = await getPersonForUser({ userId })

    if (person) {
      creatorName = person?.name
    }
  } catch (error) {}

  let inviterName = ''
  if (invitedBy) {
    try {
      const person = await getPersonForUser({ userId: invitedBy })

      if (person) {
        inviterName = person?.name
      }
    } catch (error) {}
  }

  return {
    error: false,
    family: {
      familyId,
      name,
      about,
    },
    inviterName,
    creatorName,
    code,
  }
}
