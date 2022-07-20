import { Express, RequestHandler } from 'express'
import { AUTHN } from './env'
import { addFakeAuthRoutes } from './fakeAuth/addFakeAuthRoutes'
import { addPasswordAuthRoutes } from './passwordAuth/addPasswordAuthRoutes'

export const registerAuth = (app: Express) => {
  if (AUTHN === 'password') {
    addPasswordAuthRoutes(app)
  }

  if (AUTHN === 'fake') {
    // For demo only
    addFakeAuthRoutes(app)
  }
}

export const requireAuth = (): RequestHandler => {
  return (request, response, next) => {
    if (!request.session.user) {
      return response.redirect(`/login.html?redirectTo=${request.url}`)
    }
    next()
  }
}
