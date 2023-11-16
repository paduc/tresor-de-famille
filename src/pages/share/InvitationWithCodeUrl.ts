import { BASE_URL } from '../../dependencies/env'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

export const InvitationWithCodeUrl = (familyId: FamilyId, code: FamilyShareCode) => {
  const shareUrl = new URL(BASE_URL + '/invitation.html')
  shareUrl.searchParams.append('familyId', familyId)
  shareUrl.searchParams.append('code', code)

  return shareUrl.toString()
}
