import z, { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { pageRouter } from '../pageRouter'
import { ConnexionPage } from './ConnexionPage'
import { makeLogin } from './login'
import { makeRegister } from './register'
import { addToHistory } from '../../dependencies/addToHistory'
import { ALGOLIA_SEARCHKEY, PASSWORD_SALT, REGISTRATION_CODE } from '../../dependencies/env'
import { parseZodErrors } from '../../libs/parseZodErrors'
import { getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdForUserId } from '../_getPersonIdForUserId.query'
import { searchClient } from '../../dependencies/search'

const login = makeLogin(bcrypt.compare)
const register = makeRegister({
  addToHistory: addToHistory,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

const REGISTRATION_CODES = REGISTRATION_CODE.split(',')

pageRouter
  .route(['/login.html', '/register.html'])
  .get(async (request, response) => {
    const { redirectTo, code } = z
      .object({
        code: z.string().optional(),
        redirectTo: z.string().optional(),
      })
      .parse(request.query)

    responseAsHtml(
      request,
      response,
      ConnexionPage({ redirectTo, code, loginType: request.path === '/register.html' ? 'register' : 'login' })
    )
  })
  .post(async (request, response) => {
    try {
      const { loginType, email, password, redirectTo, code } = z
        .object({
          loginType: z.enum(['login', 'register']),
          email: z.string().email(),
          password: z.string().min(8),
          redirectTo: z.string().optional(),
          code: z.string().optional(),
        })
        .parse(request.body)

      // Registration case
      if (loginType === 'register') {
        if (REGISTRATION_CODE && (!code || !REGISTRATION_CODES.includes(code))) {
          return responseAsHtml(
            request,
            response,
            ConnexionPage({
              errors: {
                other: "Désolé mais les inscriptions sont fermées pour le moment. Merci de revenir avec un lien d'invitation.",
              },
              loginType,
              email,
              redirectTo,
            })
          )
        }

        const userId = await register(email, password, code)

        request.session.user = { id: userId, name: '' }

        request.session.searchKey = searchClient.generateSecuredApiKey(ALGOLIA_SEARCHKEY, {
          filters: `visible_by:user/${userId}`,
        })

        return response.redirect(redirectTo || '/')
      }

      // Login case
      const userId = await login(email, password)
      try {
        const personId = await getPersonIdForUserId(userId)
        const person = await getPersonByIdOrThrow(personId)
        request.session.user = { id: userId, name: person.name }
        request.session.searchKey = searchClient.generateSecuredApiKey(ALGOLIA_SEARCHKEY, {
          filters: `visible_by:user/${userId} OR visible_by:person/${personId}`,
        })
      } catch (error) {
        request.session.searchKey = searchClient.generateSecuredApiKey(ALGOLIA_SEARCHKEY, {
          filters: `visible_by:user/${userId}`,
        })
        request.session.user = { id: userId, name: '' }
      }

      response.redirect(redirectTo || '/')
    } catch (error) {
      const { loginType, email, redirectTo, code } = request.body
      return responseAsHtml(
        request,
        response,
        ConnexionPage({
          errors:
            error instanceof ZodError
              ? parseZodErrors(error)
              : { other: error instanceof Error ? error.message : 'Erreur inconnue' },
          loginType,
          email,
          redirectTo,
          code,
        })
      )
    }
  })

pageRouter.all('/logout', async (request, response) => {
  if (request.session) {
    request.session.destroy((error) => {
      if (error) {
        response.status(400).send('Impossible de se déconnecter')
      } else {
        response.redirect('/')
      }
    })
  } else {
    response.redirect('/')
  }
})
