import { Express } from 'express'
import z, { ZodError } from 'zod'

import { responseAsHtml } from '../../libs/responseAsHtml'
import { makeLogin } from './login'
import { ConnexionPage } from './passwordConnexionPage'
import bcrypt from 'bcryptjs'
import { makeRegister } from './register'
import { publish } from '../eventStore'
import { parseZodErrors } from '../../libs/parseZodErrors'
import { PASSWORD_SALT } from '../env'

const login = makeLogin(bcrypt.compare)
const register = makeRegister({
  publish: publish,
  hashPassword: (password: string) => bcrypt.hash(password, PASSWORD_SALT),
})

export const addPasswordAuthRoutes = (app: Express) => {
  app.get('/login.html', async (request, response) => {
    const { redirectTo } = request.query

    responseAsHtml(request, response, ConnexionPage({ redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined }))
  })

  app.post('/login.html', async (request, response) => {
    try {
      const { loginType, email, password, redirectTo } = z
        .object({
          loginType: z.enum(['login', 'register']),
          email: z.string().email(),
          password: z.string().min(8),
          redirectTo: z.string().optional(),
        })
        .parse(request.body)

      const userId = loginType === 'login' ? await login(email, password) : await register(email, password)

      request.session.user = { id: userId, name: email }
      response.redirect(redirectTo || '/')
    } catch (error) {
      const { loginType, email, redirectTo } = request.body
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
        })
      )
    }
  })
}
