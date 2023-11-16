import { FamilyId } from '../../domain/FamilyId'
import { FamilyShareCode } from '../../domain/FamilyShareCode'
import { InvitationPageProps } from './InvitationPage'

export const getInvitationPageProps = async (familyId: FamilyId, code: FamilyShareCode): Promise<InvitationPageProps> => {
  return {
    error: false,
    familyName: '',
    inviterName: '',
  }
}
