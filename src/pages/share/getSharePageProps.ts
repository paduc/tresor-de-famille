import { AppUserId } from '../../domain/AppUserId'
import { getUserFamilies } from '../_getUserFamilies'
import { InvitationWithCodeUrl } from './InvitationWithCodeUrl'
import { SharePageProps } from './SharePage'

export const getSharePageProps = async (userId: AppUserId): Promise<SharePageProps> => {
  return {
    userFamilies: (await getUserFamilies(userId)).map(({ familyId, familyName, shareCode, about }) => {
      return {
        familyId,
        name: familyName,
        about,
        shareUrl: InvitationWithCodeUrl(familyId, shareCode),
      }
    }),
  }
}
