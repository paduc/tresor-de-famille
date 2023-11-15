import { getEventList } from '../../dependencies/getEventList'
import { AppUserId } from '../../domain/AppUserId'
import { InvitationWithCodeUrl } from './InvitationWithCodeUrl'
import { SharePageProps } from './SharePage'
import { UserCreatedNewFamily } from './UserCreatedNewFamily'

export const getSharePageProps = async (userId: AppUserId): Promise<SharePageProps> => {
  const userFamiliesEvent = await getEventList<UserCreatedNewFamily>('UserCreatedNewFamily', { userId })

  return {
    userFamilies: userFamiliesEvent.map(({ payload: { familyId, familyName, shareCode, about } }) => {
      return {
        familyId,
        name: familyName,
        about,
        shareUrl: InvitationWithCodeUrl(shareCode),
      }
    }),
  }
}
