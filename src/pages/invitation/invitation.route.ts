import { z } from 'zod'
import { requireAuth } from '../../dependencies/authn'
import { isFamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { isFamilyShareCode, zIsFamilyShareCode } from '../../domain/FamilyShareCode'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { InvitationPage } from './InvitationPage'
import { getInvitationPageProps } from './getInvitationPageProps'

pageRouter
  .route('/invitation.html')
  .get(async (request, response) => {
    try {
      const { code, familyId } = z
        .object({
          code: zIsFamilyShareCode,
          familyId: zIsFamilyId,
        })
        .parse(request.query)

      const props = await getInvitationPageProps(familyId, code)

      responseAsHtml(request, response, InvitationPage(props))
    } catch (error) {
      console.log('')
    }
  })
  .post(requireAuth(), async (request, response) => {
    const { action } = z
      .object({
        action: z.string(),
      })
      .parse(request.body)

    const userId = request.session.user!.id
  })
