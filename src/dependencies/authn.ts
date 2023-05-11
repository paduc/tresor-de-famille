import { RequestHandler } from 'express'

export const requireAuth = (): RequestHandler => {
  return (request, response, next) => {
    if (!request.session.user) {
      if (!request.url || request.url === '/') {
        return response.redirect('/login.html')
      }
      return response.redirect(`/login.html?redirectTo=${request.url}`)
    }
    next()
  }
}
