import { BASE_URL } from '../../dependencies/env'
import { FamilyShareCode } from '../../domain/FamilyShareCode'

export const InvitationWithCodeUrl = (code: FamilyShareCode) => {
  const shareUrl = new URL(BASE_URL + '/invitation.html')
  shareUrl.searchParams.append('code', code)

  return shareUrl.toString()
}
