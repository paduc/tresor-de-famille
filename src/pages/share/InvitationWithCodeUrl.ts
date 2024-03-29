import { BASE_URL } from '../../dependencies/env.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'

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
