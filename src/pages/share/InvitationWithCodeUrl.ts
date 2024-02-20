import { BASE_URL } from '../../dependencies/env'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

export const InvitationWithCodeUrl = ({
  familyId,
  code,
  invitedBy,
}: {
  familyId: FamilyId
  code: FamilyShareCode
  invitedBy?: AppUserId
}) => {
  const shareUrl = new URL(BASE_URL + '/invitation.html')
  shareUrl.searchParams.append('familyId', familyId)
  shareUrl.searchParams.append('code', code)
  if (invitedBy) {
    shareUrl.searchParams.append('invitedBy', invitedBy)
  }

  return shareUrl.toString()
}
