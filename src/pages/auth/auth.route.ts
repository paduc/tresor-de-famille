import bcrypt from 'bcryptjs'
import z, { ZodError } from 'zod'

import { addToHistory } from '../../dependencies/addToHistory.js'
import { PASSWORD_SALT, REGISTRATION_CODE } from '../../dependencies/env.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself.js'
import { parseZodErrors } from '../../libs/parseZodErrors.js'
import { responseAsHtml } from '../../libs/ssr/responseAsHtml.js'
import { pageRouter } from '../pageRouter.js'
import { ConnexionPage } from './ConnexionPage.js'
import { buildSession } from './buildSession.js'
import { makeLogin } from './login.js'
import { makeRegister } from './register.js'
import { getPersonForUser } from '../_getPersonForUser.js'

const login = makeLogin(bcrypt.compare)
const register = makeRegister({
  addToHistory: addToHistory,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

const REGISTRATION_CODES = REGISTRATION_CODE.split(',')

pageRouter
  .route(['/login.html', '/register.html'])
  .get(async (request, response, next) => {
    try {
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
    } catch (error) {
      next(error)
    }
  })
  .post(async (request, response, next) => {
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

        buildSession({ userId, request, isFirstConnection: true })

        return response.redirect(redirectTo || '/')
      }

      // Login case
      const userId = await login(email, password)
      try {
        const userPerson = await getPersonForUser({ userId })

        const name = userPerson?.name || ''

        buildSession({ userId, name, request })
      } catch (error) {
        buildSession({ userId, request })
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

pageRouter.all('/logout', async (request, response, next) => {
  try {
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
  } catch (error) {
    next(error)
  }
})
