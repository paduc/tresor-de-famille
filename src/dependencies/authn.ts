import { Express, RequestHandler } from 'express'
import { AUTHN } from './env'
import { addPasswordAuthRoutes } from './passwordAuth/addPasswordAuthRoutes'

export const registerAuth = (app: Express) => {
  if (AUTHN === 'password') {
    addPasswordAuthRoutes(app)
  }
}

export const requireAuth = (): RequestHandler => {
  return (request, response, next) => {
    if (!request.session.user) {
      console.log('Cannot find user session, redirecting to login')
      return response.redirect(`/login.html?redirectTo=${request.url}`)
    }
    next()
  }
}
