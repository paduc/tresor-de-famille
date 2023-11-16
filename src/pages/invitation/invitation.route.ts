import { z } from 'zod'
import { zIsFamilyId } from '../../domain/FamilyId'
import { zIsFamilyShareCode } from '../../domain/FamilyShareCode'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { InvitationPage } from './InvitationPage'
import { getInvitationPageProps } from './getInvitationPageProps'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { addToHistory } from '../../dependencies/addToHistory'
import { UserAcceptedInvitation } from './UserAcceptedInvitation'

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
      console.error('Invitation foireuse', error)
      throw error
    }
  })
  .post(async (request, response) => {
    const { action, familyId, code } = z
      .object({
        action: z.string(),
        familyId: zIsFamilyId,
        code: zIsFamilyShareCode,
      })
      .parse(request.body)

    if (action === 'accept') {
      // Revalidate code
      const invitation = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId, shareCode: code })

      if (!invitation) {
        throw new Error('Invitation incomplète ou erronée.')
      }

      const userId = request.session.user?.id

      if (userId) {
        await addToHistory(
          UserAcceptedInvitation({
            familyId,
            userId,
            shareCode: code,
          })
        )

        request.session.currentFamilyId = familyId
      }
    }

    response.redirect('/')
  })
