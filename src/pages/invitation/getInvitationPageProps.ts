import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { getPersonById } from '../_getPersonById'
import { getPersonIdForUserId } from '../_getPersonIdForUserId'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { InvitationPageProps } from './InvitationPage'

export const getInvitationPageProps = async (familyId: FamilyId, code: FamilyShareCode): Promise<InvitationPageProps> => {
  const invitation = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId, shareCode: code })

  if (!invitation) {
    throw new Error('Invitation incomplète ou erronée.')
  }

  const { familyName: name, about, userId } = invitation.payload

  let inviterName = "Quelqu'un"
  try {
    const personId = await getPersonIdForUserId(userId)
    const person = await getPersonById(personId)

    if (person) {
      inviterName = person?.name
    }
  } catch (error) {}

  return {
    error: false,
    family: {
      familyId,
      name,
      about,
    },
    inviterName,
    code,
  }
}
