import { Express } from 'express'
import { responseAsHtml } from '../../libs/responseAsHtml'
import { FakeConnexionPage } from './fakeConnexionPage'
import { getFakeUsers } from './getFauxUtilisateurs.query'

export const addFakeAuthRoutes = (app: Express) => {
  app.get('/login.html', async (request, response) => {
    const fakeUsers = await getFakeUsers()
    const { redirectTo } = request.query

    responseAsHtml(
      request,
      response,
      FakeConnexionPage({ fakeUsers, redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined })
    )
  })

  app.post('/login.html', async (request, response) => {
    const fakeUsers = await getFakeUsers()
    const { userId, redirectTo } = request.body

    const user = fakeUsers.find((user) => user.userId === userId)

    if (!user) {
      return response.status(403)
    }
    console.log('here')

    request.session.user = { id: userId, name: user.nom }
    response.redirect(redirectTo || '/')
  })
}
