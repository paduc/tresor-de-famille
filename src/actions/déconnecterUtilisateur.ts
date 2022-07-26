import { actionsRouter } from './actionsRouter';

actionsRouter.post('/logout', async (request, response) => {
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
