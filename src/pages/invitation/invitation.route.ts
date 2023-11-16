import bcrypt from 'bcryptjs'
import { ZodError, z } from 'zod'
import { addToHistory } from '../../dependencies/addToHistory'
import { ALGOLIA_SEARCHKEY, PASSWORD_SALT } from '../../dependencies/env'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { FamilyId, zIsFamilyId } from '../../domain/FamilyId'
import { zIsFamilyShareCode } from '../../domain/FamilyShareCode'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { makeRegisterWithInvite } from '../auth/registerWithInvite'
import { pageRouter } from '../pageRouter'
import { UserCreatedNewFamily } from '../share/UserCreatedNewFamily'
import { InvitationPage } from './InvitationPage'
import { UserAcceptedInvitation } from './UserAcceptedInvitation'
import { getInvitationPageProps } from './getInvitationPageProps'
import { searchClient } from '../../dependencies/search'
import { buildSession } from '../auth/buildSession'
import { getUserFamilies } from '../_getUserFamilies'
import { parseZodErrors } from '../../libs/parseZodErrors'

const registerWithInvite = makeRegisterWithInvite({
  addToHistory: addToHistory,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

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

        request.session.currentFamilyId = familyId
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

        buildSession({ userId, request })

        request.session.currentFamilyId = familyId
      } catch (error) {
        const props = await getInvitationPageProps(familyId, code)
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
  })