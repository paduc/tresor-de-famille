import { Express } from 'express'
import z, { ZodError } from 'zod'

import { responseAsHtml } from '../../libs/ssr/responseAsHtml'
import { makeLogin } from './login'
import { ConnexionPage } from './passwordConnexionPage'
import bcrypt from 'bcryptjs'
import { makeRegister } from './register'
import { publish } from '../eventStore'
import { parseZodErrors } from '../../libs/parseZodErrors'
import { PASSWORD_SALT, REGISTRATION_CODE } from '../env'
import { getPersonForUserId } from '../../pages/home/getPersonForUserId.query'

const login = makeLogin(bcrypt.compare)
const register = makeRegister({
  publish: publish,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

export const addPasswordAuthRoutes = (app: Express) => {
  app.get('/login.html', async (request, response) => {
    const { redirectTo, code } = z
      .object({
        code: z.string().optional(),
        redirectTo: z.string().optional(),
      })
      .parse(request.query)

    responseAsHtml(request, response, ConnexionPage({ redirectTo, code }))
  })

  app.post('/login.html', async (request, response) => {
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
        if (code !== REGISTRATION_CODE) {
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

        request.session.user = { id: userId, name: email }
        return response.redirect(redirectTo || '/')
      }

      // Login case
      const userId = await login(email, password)
      try {
        const person = await getPersonForUserId(userId)
        request.session.user = { id: userId, name: person.name }
      } catch (error) {
        request.session.user = { id: userId, name: email }
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
}
