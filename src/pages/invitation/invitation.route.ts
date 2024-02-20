import bcrypt from 'bcryptjs'
import { ZodError, z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { PASSWORD_SALT } from '../../dependencies/env'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { zIsFamilyId } from '../../domain/FamilyId'
import { zIsFamilyShareCode } from '../../domain/FamilyShareCode'
import { parseZodErrors } from '../../libs/parseZodErrors'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { getUserFamilies } from '../_getUserFamilies'
import { buildSession } from '../auth/buildSession'
import { makeRegisterWithInvite } from '../auth/registerWithInvite'
import { pageRouter } from '../pageRouter'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { InvitationPage } from './InvitationPage'
import { UserAcceptedInvitation } from './UserAcceptedInvitation'
import { getInvitationPageProps } from './getInvitationPageProps'
import { zIsAppUserId } from '../../domain/AppUserId'

const registerWithInvite = makeRegisterWithInvite({
  addToHistory: addToHistory,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

pageRouter
  .route('/invitation.html')
  .get(async (request, response, next) => {
    try {
      const { code, familyId, invitedBy } = z
        .object({
          code: zIsFamilyShareCode,
          familyId: zIsFamilyId,
          invitedBy: zIsAppUserId.optional(),
        })
        .parse(request.query)

      const userId = request.session.user?.id
      if (userId) {
        const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

        // Check if the user is already a member of this family
        if (userFamilyIds.includes(familyId)) {
          return response.redirect('/')
        }
      }

      const props = await getInvitationPageProps({ familyId, code, invitedBy })

      responseAsHtml(request, response, InvitationPage(props))
    } catch (error) {
      console.error('Invitation ratée', error)
      next(error)
    }
  })
  .post(async (request, response, next) => {
    try {
      const { action, familyId, code } = z
        .object({
          action: z.string(),
          familyId: zIsFamilyId,
          code: zIsFamilyShareCode,
        })
        .parse(request.body)

      // Revalidate code
      const invitation = await getSingleEvent<UserCreatedNewFamily>('UserCreatedNewFamily', { familyId, shareCode: code })

      if (!invitation) {
        throw new Error('Invitation incomplète ou erronée.')
      }

      if (action === 'accept') {
        const userId = request.session.user?.id

        if (userId) {
          const userFamilyIds = (await getUserFamilies(userId)).map((f) => f.familyId)

          // Check if the user is already a member of this family
          if (!userFamilyIds.includes(familyId)) {
            await addToHistory(
              UserAcceptedInvitation({
                familyId,
                userId,
                shareCode: code,
              })
            )
          }
        }
      } else if (action === 'registerWithInvite') {
        try {
          const { email, password } = z
            .object({
              email: z.string().email(),
              password: z.string().min(8),
            })
            .parse(request.body)

          const userId = await registerWithInvite({ email, password, familyId, shareCode: code })

          buildSession({ userId, request, isFirstConnection: true })
        } catch (error) {
          const props = await getInvitationPageProps({ familyId, code, invitedBy: undefined })
          const { email } = request.body
          return responseAsHtml(
            request,
            response,
            InvitationPage({
              ...props,
              email,
              errors:
                error instanceof ZodError
                  ? parseZodErrors(error)
                  : { other: error instanceof Error ? error.message : 'Erreur inconnue' },
            })
          )
        }
      }

      response.redirect('/')
    } catch (error) {
      next(error)
    }
  })
